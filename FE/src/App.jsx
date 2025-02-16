import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import ExcelComparison from './components/FileCompare/FileCompare';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ExcelComparison />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;