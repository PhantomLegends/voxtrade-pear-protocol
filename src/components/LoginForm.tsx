import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { CryptoInput } from "./ui/crypto-input";
import { CryptoButton } from "./ui/crypto-button";
import { toast } from "sonner";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    
    // Simulate login
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("Welcome to Voxtrade!", {
      description: "Login successful",
    });
    
    setIsLoading(false);
    navigate("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5">
      {/* Email input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Email Address
        </label>
        <CryptoInput
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-5 h-5" />}
          autoComplete="email"
        />
      </div>

      {/* Password input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Password
        </label>
        <div className="relative">
          <CryptoInput
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-5 h-5" />}
            autoComplete="current-password"
            className="pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Forgot password link */}
      <div className="flex justify-end">
        <button
          type="button"
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          Forgot Password?
        </button>
      </div>

      {/* Login button */}
      <CryptoButton
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Signing In...
          </div>
        ) : (
          "Sign In"
        )}
      </CryptoButton>

      {/* Sign up link */}
      <p className="text-center text-muted-foreground">
        Don't have an account?{" "}
        <button
          type="button"
          className="text-primary hover:text-primary/80 font-semibold transition-colors"
        >
          Create Account
        </button>
      </p>
    </form>
  );
};

export default LoginForm;
