import React, { useState } from "react";
import axios from "axios";

export default function Auth({ setUsername }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsernameInput] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Kiểm tra dữ liệu
    if (isLogin) {
      if (!username || !password) {
        setError("Vui lòng điền đầy đủ thông tin");
        return;
      }
    } else {
      if (!email || !username || !password) {
        setError("Vui lòng điền đầy đủ thông tin");
        return;
      }
    }

    try {
      const url = isLogin
        ? "http://localhost:5000/login"
        : "http://localhost:5000/register";
      const payload = isLogin
        ? { username, password }  // login chỉ dùng username
        : { email, username, password };

      console.log("Sending:", payload);
      const response = await axios.post(url, payload);

      setUsername(response.data.username);
      localStorage.setItem("username", response.data.username);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Có lỗi xảy ra");
    }
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-gray-300">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-4">
          {isLogin ? "Đăng nhập" : "Đăng ký"}
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {isLogin ? (
          <input
            type="text"
            placeholder="Tên người dùng"
            value={username}
            onChange={(e) => setUsernameInput(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
            required
          />
        ) : (
          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 mb-4 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Tên người dùng"
              value={username}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="w-full p-2 mb-4 border rounded"
              required
            />
          </>
        )}

        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full p-2 bg-[#122670] text-white rounded hover:bg-yellow-100 hover:text-black"
        >
          {isLogin ? "Đăng nhập" : "Đăng ký"}
        </button>

        <p className="mt-4 text-center">
          {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 underline"
          >
            {isLogin ? "Đăng ký" : "Đăng nhập"}
          </button>
        </p>
      </form>
    </div>
  );
}
