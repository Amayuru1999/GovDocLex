import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";
import forget from "../assets/images/forget.jpg"; // change image if you want
import footerbackheight from "../assets/images/footerbackheight.png";
import { toast } from "react-toastify";

export default function ForgetPassword() {
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    try {
      await axios.post(`${import.meta.env.VITE_SERVER_API}/forgot-password`, { email });
      toast.success("Password reset link has been sent to your email!");
      navigate("/signin");
    } catch (err: any) {
      console.error("Forget password error:", err);
      toast.error(err.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 max-w-[1920px] mx-auto relative">
      {/* Left: Forget Password form */}
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

          <h2 className="text-2xl font-bold mb-2">Forgot Password</h2>
          <p className="mb-6 text-gray-500">
            Enter your email address and we’ll send you a link to reset your password.
          </p>

          {/* ✅ Forget password form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                name="email"
                placeholder="example@gmail.com"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-800"
                autoComplete="off"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#0a1117] text-white py-2 rounded font-semibold hover:bg-green-900 transition"
            >
              Send Reset Link
            </button>
          </form>
        </div>
      </div>

      {/* Right: Promo / Image */}
      <div className="hidden md:flex flex-col flex-1 bg-[#0a1117] text-white justify-center px-12 py-8 relative items-center">
        <div className="rounded-xl p-6 mb-8 max-w-md">
          <img
            src={forget}
            alt="Forget Password"
            className="w-full h-96 object-cover rounded-xl mb-4"
          />
        </div>
        <div className="flex items-center justify-center flex-col text-center">
          <h3 className="text-4xl font-semibold mb-3">Reset Your Password</h3>
          <p className="text-gray-200 max-w-md text-xl">
            Securely reset your account password and regain access.
          </p>
        </div>
        <img
          src={footerbackheight}
          alt="Background"
          className="absolute bottom-0 left-0 w-full object-cover opacity-50"
        />
      </div>
    </div>
  );
}
