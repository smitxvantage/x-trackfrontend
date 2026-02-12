import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/authStore";
import { uploadAvatarApi } from "@/api/profile.api";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";


export default function Profile() {
  const user = useAuthStore((state) => state.user);
  if (!user) {
    return null; // or a loader
  }


  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);



  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
        <p className="text-muted-foreground mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-4 h-fit">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <Avatar className="h-32 w-32 mb-4">
              <AvatarImage
                src={
                  avatarPreview ||
                  (user.avatar
                    ? `${import.meta.env.VITE_API_BASE_URL}${user.avatar}`
                    : undefined)
                }
              />

              <AvatarFallback className="text-4xl font-semibold">
                {user.name
                  ?.split(" ")
                  .filter(Boolean)
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>

            </Avatar>

            <input
              type="file"
              accept="image/*"
              id="avatarUpload"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                setAvatarFile(file);
                setAvatarPreview(URL.createObjectURL(file));
              }}
            />

            <Button
              variant="outline"
              className="w-full mb-2"
              onClick={() => document.getElementById("avatarUpload")?.click()}
            >
              Change Photo
            </Button>

            <p className="text-xs text-muted-foreground">
              JPG, GIF or PNG. Max size of 800K
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-8">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" defaultValue={user?.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue={user?.email} disabled />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="+1 (555) 000-0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="123 Main St, City, Country" />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-medium">Employment Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input defaultValue={user?.department} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input defaultValue={user?.role} disabled className="capitalize" />
                </div>
                <div className="space-y-2">
                  <Label>Joining Date</Label>
                  <Input defaultValue="Oct 24, 2022" disabled />
                </div>
                <div className="space-y-2">
                  <Label>Employee ID</Label>
                  <Input defaultValue="EMP-001" disabled />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="ghost">Cancel</Button>
              <Button
                onClick={async () => {
                  if (!avatarFile) {
                    toast({ title: "No image selected" });
                    return;
                  }

                  try {
                    const res = await uploadAvatarApi(avatarFile);

                    useAuthStore.setState((state) => {
                      if (!state.user) return state;

                      return {
                        ...state,
                        user: {
                          ...state.user,
                          avatar: res.data.data.avatar,
                        },
                      };
                    });


                    toast({ title: "Profile photo updated" });
                  } catch {
                    toast({
                      title: "Failed to upload photo",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Save Changes
              </Button>

            </div>
          </CardContent>
        </Card>

        {/* <Card className="md:col-span-12">
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your password and security preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="currentPass">Current Password</Label>
                <Input id="currentPass" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPass">New Password</Label>
                <Input id="newPass" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPass">Confirm Password</Label>
                <Input id="confirmPass" type="password" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline">Update Password</Button>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
