'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export default function SetupPage() {
  const [_, setConfig] = useLocalStorage('firebaseConfig', {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  });

  const [script, setScript] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSave = () => {
    try {
      // Extract the JSON object from the script
      const jsonString = script.substring(script.indexOf('{'), script.lastIndexOf('}') + 1);
      const parsedConfig = JSON.parse(jsonString);

      // Basic validation
      const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
      const missingKeys = requiredKeys.filter(key => !parsedConfig[key]);

      if (missingKeys.length > 0) {
        throw new Error(`Missing required keys: ${missingKeys.join(', ')}`);
      }

      setConfig(parsedConfig);

      toast({
        title: 'Configuration Saved',
        description: 'Your Firebase config has been saved. You will be redirected to the login page.',
      });

      // Redirect to login page to re-initialize firebase with new config
      setTimeout(() => {
          router.push('/login');
      }, 2000);

    } catch (error) {
      console.error(error);
      toast({
        title: 'Invalid Script',
        description: 'Could not parse the Firebase config. Please paste the entire script, including "const firebaseConfig = { ... };".',
        variant: 'destructive',
      });
    }
  };

  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Firebase Setup</CardTitle>
          <CardDescription>
            Paste your entire Firebase project configuration script here. This will be saved in
            your browser&apos;s local storage.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="firebase-script">Firebase Config Script</Label>
            <Textarea
              id="firebase-script"
              placeholder="const firebaseConfig = { ... };"
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className="min-h-[200px] font-mono text-xs"
            />
          </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleSave} className="w-full">
                Save Configuration & Go to Login
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
