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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export default function SetupPage() {
  const [config, setConfig] = useLocalStorage('firebaseConfig', {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  });

  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setConfig((prevConfig) => ({ ...prevConfig, [id]: value }));
  };

  const handleSave = () => {
    // Basic validation
    if (Object.values(config).some(v => v === '')) {
      toast({
        title: 'Incomplete Configuration',
        description: 'Please fill out all Firebase configuration fields.',
        variant: 'destructive',
      });
      return;
    }
    // The useLocalStorage hook already saves on change, but we'll toast on explicit save.
    toast({
      title: 'Configuration Saved',
      description: 'Your Firebase config has been saved to local storage. You will be redirected to the login page.',
    });
    
    // Redirect to login page to re-initialize firebase with new config
    setTimeout(() => {
        router.push('/login');
    }, 2000);
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
            Enter your Firebase project configuration here. This will be saved in
            your browser&apos;s local storage.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="apiKey" className="text-right">API Key</Label>
            <Input id="apiKey" value={config.apiKey} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="authDomain" className="text-right">Auth Domain</Label>
            <Input id="authDomain" value={config.authDomain} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="projectId" className="text-right">Project ID</Label>
            <Input id="projectId" value={config.projectId} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="storageBucket" className="text-right">Storage Bucket</Label>
            <Input id="storageBucket" value={config.storageBucket} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="messagingSenderId" className="text-right">Messaging Sender ID</Label>
            <Input id="messagingSenderId" value={config.messagingSenderId} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="appId" className="text-right">App ID</Label>
            <Input id="appId" value={config.appId} onChange={handleChange} className="col-span-3" />
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