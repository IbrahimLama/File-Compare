import React, { useState } from "react";
import styles from "./Login.module.css";

const Login = ({ useLdap = false, ldapDomain = "", enableSSO = false }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  
  const validate = () => {
    const errors = {};
    if (!formData.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Invalid email format";
    if (!formData.password) errors.password = "Password is required";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      try {
        // Append domain if using LDAP and domain is provided
        const emailWithDomain = useLdap && ldapDomain
          ? `${formData.email}@${ldapDomain}`
          : formData.email;

        const response = await fetch(useLdap ? "/api/login/ldap" : "/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, email: emailWithDomain }),
        });
        const data = await response.json();
        if (response.ok) {
          console.log("Login successful", data);
        } else {
          setErrors({ server: data.message });
        }
      } catch (err) {
        console.error("Login failed:", err);
        setErrors({ server: "An error occurred. Please try again." });
      }
    }
  };

  const handleSSORedirect = () => {
    // Redirect to the SSO endpoint
    window.location.href = "/auth/sso";
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          {errors.email && <p className={styles.error}>{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          {errors.password && <p className={styles.error}>{errors.password}</p>}
        </div>
        {errors.server && <p className={styles.error}>{errors.server}</p>}
        <button type="submit">
          {useLdap ? "Login with LDAP" : "Login"}
        </button>
      </form>

      {enableSSO && (
        <div className={styles.ssoContainer}>
          <button onClick={handleSSORedirect} className={styles.ssoButton}>
            Login with SSO
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;
