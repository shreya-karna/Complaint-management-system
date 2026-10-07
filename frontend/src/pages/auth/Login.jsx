import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";

import { loginUser, resendVerificationEmail } from "../../services/userService";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [captchaToken, setCaptchaToken] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setResendMessage("");
    setShowResend(false);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (!captchaToken) {
      setError("Please complete the CAPTCHA.");
      return;
    }

    setLoading(true);

    try {
      const response = await loginUser(email.trim(), password, captchaToken);

      const user = response.user;

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "ADMIN") {
        navigate("/admin");
      } else if (user.role === "STAFF") {
        navigate("/staff");
      } else {
        navigate("/");
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Login failed. Please check your email and password.";

      setError(message);

      if (message.toLowerCase().includes("verify your email")) {
        setShowResend(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setError("");
    setSuccess("");
    setResendMessage("");

    if (!email.trim()) {
      setResendMessage("Please enter your email address first.");
      return;
    }

    setResendLoading(true);

    try {
      const response = await resendVerificationEmail(email.trim());
      setResendMessage(
        response.message || "Verification email sent. Please check your email.",
      );
    } catch (err) {
      setResendMessage(
        err.response?.data?.message || "Failed to send verification email.",
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 py-10 dark:bg-slate-950">
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-blue-500/20 blur-3xl dark:bg-blue-600/25" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 size-96 rounded-full bg-indigo-500/20 blur-3xl dark:bg-indigo-600/25" />

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-md md:p-8 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-black/40">
          {/* Heading */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-blue-600/10 dark:bg-blue-500/15">
              <ShieldCheck className="size-6 text-blue-600 dark:text-blue-400" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Welcome Back
            </h1>

            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Login to your Complaint Management System
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-950/50 dark:text-green-400">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email Address
              </label>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                    setResendMessage("");
                  }}
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-slate-300 bg-white/70 py-3 pl-10 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>

              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-slate-300 bg-white/70 py-3 pl-10 pr-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100 dark:placeholder:text-slate-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            <div className="flex justify-center overflow-hidden rounded-lg">
              <ReCAPTCHA
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                onChange={(token) => setCaptchaToken(token)}
                onExpired={() => setCaptchaToken(null)}
                onErrored={() => setCaptchaToken(null)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:shadow-blue-500/20 dark:hover:bg-blue-600"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {showResend && (
            <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-950/50">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Your email has not been verified yet.
              </p>

              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="mt-3 w-full rounded-lg border border-blue-600 bg-white px-4 py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white"
              >
                {resendLoading ? "Sending..." : "Resend Verification Email"}
              </button>

              {resendMessage && (
                <p className="mt-3 text-sm text-blue-800 dark:text-blue-300">
                  {resendMessage}
                </p>
              )}
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="font-medium text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Register here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
