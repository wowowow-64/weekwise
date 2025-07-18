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
import { encrypt } from '@/lib/crypto';


export default function SetupPage() {
  const [_, setConfig] = useLocalStorage('firebaseConfig', '');

  const [script, setScript] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSave = () => {
    try {
      if (!script.includes('firebaseConfig')) {
        throw new Error("Invalid script format. Please paste the entire Firebase config snippet.");
      }

      // Safely evaluate the script to get the config object
      // This is a controlled environment, only for this specific config format.
      const firebaseConfig = (new Function(`${script}; return firebaseConfig;`))();

      if (!firebaseConfig) {
        throw new Error("Could not extract firebaseConfig object from the script.");
      }

      // Basic validation
      const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
      const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

      if (missingKeys.length > 0) {
        throw new Error(`Missing required keys in config: ${missingKeys.join(', ')}`);
      }

      const configString = JSON.stringify(firebaseConfig);
      const encryptedConfig = encrypt(configString);
      setConfig(encryptedConfig);


      toast({
        title: 'Configuration Saved',
        description: 'Your Firebase config has been saved. The page will now reload.',
      });

      // Reload the page to re-initialize firebase with new config
      setTimeout(() => {
          window.location.href = '/login';
      }, 2000);

    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Invalid Script',
        description: error.message || 'Could not parse the Firebase config. Please paste the entire script, including "const firebaseConfig = { ... };".',
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
            Paste your entire Firebase project configuration script here. This will be saved securely
            in your browser&apos;s local storage for offline use.
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
