import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import reset from "../assets/images/reset.jpg"; // add your own reset password image
import footerbackheight from "../assets/images/footerbackheight.png";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_API}/reset-password/${token}`,
        { password }
      );
      toast.success("Password has been reset successfully!");
      navigate("/signin");
    } catch (err: any) {
      console.error("Reset password error:", err);
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left: Reset Password form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          {/* Logo & Back */}
          <div className="mb-6 flex items-center gap-2">
            <button
              className="text-2xl font-extrabold text-green-800 cursor-pointer"
              onClick={() => navigate("/signin")}
              aria-label="Go back to home page"
            >
              <FaArrowLeft className="w-4 text-[#0a1117]" />
            </button>
            <span className="text-2xl font-bold text-[#0a1117]">GovDocLex</span>
          </div>

          <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
          <p className="mb-6 text-gray-500">
            Enter your new password below and confirm it to reset your account.
          </p>

          {/* ✅ Reset password form */}
          {/* <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-800"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-800"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#0a1117] text-white py-2 rounded font-semibold hover:bg-green-900 transition"
            >
              Reset Password
            </button>
          </form> */}

          <form className="space-y-4" onSubmit={handleSubmit}>
            
            <div>
              <label className="block text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-800 pr-10"
                  required
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 cursor-pointer text-gray-600 hover:text-green-800"
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>
            </div>

            
            <div>
              <label className="block text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-800 pr-10"
                  required
                />
                <span
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 cursor-pointer text-gray-600 hover:text-green-800"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#0a1117] text-white py-2 rounded font-semibold hover:bg-green-900 transition"
            >
              Reset Password
            </button>
          </form>
        </div>
      </div>

      {/* Right: Image + Promo */}
      <div className="hidden md:flex flex-col flex-1 bg-[#0a1117] text-white justify-center px-12 py-8 relative items-center">
        <div className="rounded-xl p-6 mb-8 max-w-md">
          <img
            src={reset}
            alt="Reset Password"
            className="w-full h-96 object-contain rounded-xl mb-4"
          />
        </div>
        <div className="flex items-center justify-center flex-col text-center">
          <h3 className="text-4xl font-semibold mb-3">Create a New Password</h3>
          <p className="text-gray-200 max-w-md text-xl">
            Securely update your account password and regain access instantly.
          </p>
        </div>
        <img
          src={footerbackheight}
          alt="Background"
          className="absolute bottom-0 left-0 w-full object-cover opacity-50 "
        />
      </div>
    </div>
  );
}
