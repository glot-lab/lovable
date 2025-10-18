import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import glotLogo from '@/assets/glot-logo-new.png';

const signupSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Mot de passe trop court (min 8 caractères)'),
  confirmPassword: z.string(),
  fullName: z.string().optional(),
  companyName: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, isLoading } = useAuth();
  const { toast } = useToast();
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/organizer');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      await signIn(loginEmail, loginPassword);
      navigate('/organizer');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSignupLoading(true);
    
    try {
      const validation = signupSchema.safeParse({
        email: signupEmail,
        password: signupPassword,
        confirmPassword: signupConfirmPassword,
        fullName,
        companyName,
      });

      if (!validation.success) {
        const newErrors: Record<string, string> = {};
        validation.error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
        return;
      }

      await signUp(signupEmail, signupPassword, fullName, companyName);
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setSignupLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });

      if (error) throw error;

      toast({
        title: 'Email envoyé',
        description: 'Vérifiez votre boîte mail pour réinitialiser votre mot de passe.',
      });
      
      setForgotPasswordMode(false);
      setResetEmail('');
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'envoyer l\'email de réinitialisation',
        variant: 'destructive',
      });
    } finally {
      setResetLoading(false);
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-primary/5 via-background to-muted p-4 pt-16">
      {/* Logo */}
      <div className="mb-6 animate-scale-in">
        <a href="/" className="inline-block hover:opacity-90 transition-opacity">
          <img src={glotLogo} alt="Glot" className="h-20 md:h-24 lg:h-28 w-auto" />
        </a>
      </div>

      <Card className="w-full max-w-md glot-card">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl">Bienvenue sur Glot</CardTitle>
          <CardDescription className="text-base">
            Connectez-vous pour gérer vos événements de traduction en temps réel
          </CardDescription>
        </CardHeader>
        <CardContent>
          {forgotPasswordMode ? (
            <div className="space-y-6">
              <Button
                variant="ghost"
                onClick={() => setForgotPasswordMode(false)}
                className="mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              
              <div className="space-y-2 text-center">
                <h3 className="text-xl font-semibold">Réinitialiser le mot de passe</h3>
                <p className="text-sm text-muted-foreground">
                  Entrez votre email pour recevoir un lien de réinitialisation
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-3">
                  <Label htmlFor="reset-email" className="text-sm font-semibold">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={resetLoading}
                >
                  {resetLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    'Envoyer le lien'
                  )}
                </Button>
              </form>
            </div>
          ) : (
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
                <TabsTrigger value="login" className="text-base">Connexion</TabsTrigger>
                <TabsTrigger value="signup" className="text-base">Inscription</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-3">
                  <Label htmlFor="login-email" className="text-sm font-semibold">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="login-password" className="text-sm font-semibold">Mot de passe</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <div className="text-right">
                    <button 
                      type="button"
                      onClick={() => setForgotPasswordMode(true)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loginLoading}
                >
                  {loginLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email *</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Mot de passe *</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Confirmer mot de passe *</Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    required
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="full-name">Nom complet</Label>
                  <Input
                    id="full-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Entreprise</Label>
                  <Input
                    id="company"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={signupLoading}
                >
                  {signupLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Inscription...
                    </>
                  ) : (
                    'Créer un compte'
                  )}
                </Button>
              </form>
            </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
