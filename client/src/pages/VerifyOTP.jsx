import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { verifyOTP, resendOTP, clearError } from "../store/features/auth/authSlice";
import showToast from "../utils/toast";
import { ArrowLeft, RefreshCw, CheckCircle } from "lucide-react";
import Loader from "../components/Loader";

const VerifyOTP = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, registrationEmail } = useSelector((state) => state.auth);

  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!registrationEmail) {
      navigate("/register");
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [registrationEmail, navigate]);

  useEffect(() => {
    if (error) {
      showToast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 4) inputRefs.current[index + 1]?.focus();
  };

  const handleBackspace = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 5);
    if (pasted.length === 5) {
      setOtp(pasted.split(""));
      inputRefs.current[4]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 5) return showToast.error("Enter complete 5-digit OTP");

    const result = await dispatch(verifyOTP({ email: registrationEmail, otp: otpCode }));
    if (result.type.includes("fulfilled")) {
      showToast.success("Account verified successfully! Please login.");
      navigate("/login");
    } else {
      setOtp(["", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (timer > 0 || isResending) return;
    setIsResending(true);
    try {
      await dispatch(resendOTP(registrationEmail)).unwrap();
      showToast.success("OTP resent successfully");
      setTimer(60);
      setOtp(["", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch {
      showToast.error("Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  const isOtpComplete = otp.every((digit) => digit);
  const timeDisplay = `${Math.floor(timer / 60)}:${(timer % 60)
    .toString()
    .padStart(2, "0")}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4 sm:mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-gray-900">
          Verify Your Email
        </h2>
        <p className="text-center text-gray-600 mb-2 text-sm sm:text-base">
          We've sent a 5-digit code to
        </p>
        <p className="text-center font-medium text-gray-900 mb-6 text-sm sm:text-base break-all">
          {registrationEmail}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleBackspace(index, e)}
                onPaste={handlePaste}
                maxLength={1}
                className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-colors"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={!isOtpComplete || loading}
            className="w-full bg-indigo-600 text-white py-2.5 sm:py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors font-medium text-sm sm:text-base"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Verify Code
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-4 sm:mt-6">
          {timer > 0 ? (
            <p className="text-xs sm:text-sm text-gray-600">
              Resend code in <span className="text-indigo-600 font-medium">{timeDisplay}</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-2 mx-auto transition-colors font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${isResending && "animate-spin"}`} />
              {isResending ? "Sending..." : "Resend Code"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
