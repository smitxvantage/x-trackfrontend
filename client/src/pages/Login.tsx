import { useState } from "react";
import { useLocation } from "wouter";
import { useAuthStore } from "@/store/authStore";
import { loginApi } from "@/api/auth.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Username and password are required.",
      });
      return;
    }

    try {
      setIsLoading(true);

      // REAL API CALL
      const response = await loginApi({ username, password });
      const { user, token } = response.data.data;

      // Persist into Zustand store
      setUser(user);
      setToken(token);

      toast({
        title: "Welcome back!",
        description: `Logged in as ${user.role}`,
      });

      // Redirect based on role
      if (user.role === "admin") {
        setLocation("/admin/dashboard");
      } else {
        setLocation("/employee/dashboard");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description:
          error.response?.data?.message || "Invalid username or password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden'>
      {/* Background decorative elements */}
      <div className='absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl' />
      <div className='absolute top-1/2 -left-20 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl' />

      <Card className='w-full max-w-md border-none shadow-2xl bg-card/80 backdrop-blur-sm relative z-10'>
        <CardHeader className='space-y-1 text-center pb-8'>
          <div className='mx-auto mb-6 flex items-center justify-center'>
            <img
              src='/X-TrackLogo.png'
              alt='Xtrack Logo'
              className='h-12 w-auto object-contain'
            />
          </div>

          <CardTitle className='text-2xl font-bold tracking-tight'>
            Welcome back
          </CardTitle>
          <CardDescription>Sign in to your Xtrack account</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue='employee' className='w-full'>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='username'>Username</Label>
                <div className='relative'>
                  <User className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                  <Input
                    id='username'
                    placeholder='Enter username'
                    className='pl-10'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='password'>Password</Label>
                  <a href='#' className='text-xs text-primary hover:underline'>
                    Forgot password?
                  </a>
                </div>
                <div className='relative'>
                  <Lock className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                  <Input
                    id='password'
                    type={showPassword ? "text" : "password"}
                    className='pl-10 pr-10'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-3 text-muted-foreground hover:text-foreground'
                  >
                    {showPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </button>
                </div>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox id='remember' />
                <Label
                  htmlFor='remember'
                  className='text-sm font-normal text-muted-foreground'
                >
                  Remember me for 30 days
                </Label>
              </div>
            </div>

            <TabsContent value='employee'>
              <Button
                className='w-full mt-6 h-11 text-base'
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : null}
                Sign in as Employee
              </Button>
            </TabsContent>

            <TabsContent value='admin'>
              <Button
                className='w-full mt-6 h-11 text-base'
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : null}
                Sign in as Admin
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className='flex flex-col gap-4 text-center text-sm text-muted-foreground pb-8'>
          <p>
            Don't have an account?{" "}
            <a className='text-primary font-medium '>Contact HR</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
