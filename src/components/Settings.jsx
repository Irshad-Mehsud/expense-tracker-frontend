import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { uploadImage } from "../api/userApi";
import { Camera } from "lucide-react";

export default function Settings() {
  const { user, updateUser, deleteAccount } = useAuth();
  const { showNotification } = useNotification();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setProfilePreview(user.profilePicture || "");
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    const updates = { name, email };
    if (password) updates.password = password;

    if (profilePicture) {
      try {
        const uploadResult = await uploadImage(profilePicture);
        updates.profilePicture = uploadResult.url;
      } catch (err) {
        showNotification("error", "Failed to upload profile picture");
        setLoading(false);
        return;
      }
    }

    const result = await updateUser(updates);
    setLoading(false);

    if (result.success) {
      showNotification("success", "Profile updated successfully!");
      setPassword("");
      setProfilePicture(null);
    } else {
      showNotification("error", result.error);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    const result = await deleteAccount();
    setLoading(false);

    if (result.success) {
      showNotification("success", "Account deleted successfully!");
    } else {
      showNotification("error", result.error);
    }
  };

  return (
    <div className="p-4 lg:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Card className="border-0 shadow-2xl bg-white/70 backdrop-blur-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Account Settings
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid lg:grid-cols-2 gap-12 items-start">

            {/* RIGHT SIDE - PROFILE IMAGE (Top on Mobile) */}
            <div className="flex flex-col items-center space-y-6 order-1 lg:order-2">

              <div className="relative group">

                {/* Gradient Ring */}
                <div className="p-[3px] rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500">
                  <div className="relative">
                    <img
                      src={
                        profilePreview ||
                        "https://via.placeholder.com/200"
                      }
                      alt="Profile"
                      className="h-44 w-44 rounded-full object-cover bg-white transition duration-500 group-hover:scale-105"
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="bg-white text-black p-3 rounded-full shadow-lg hover:scale-110 transition"
                      >
                        <Camera size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setProfilePicture(file);
                      setProfilePreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>

              <div className="text-center">
                <h3 className="text-lg font-semibold">
                  {user?.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Click image to update profile photo
                </p>
              </div>
            </div>

            {/* LEFT SIDE - FORM */}
            <form
              onSubmit={handleSave}
              className="space-y-6 order-2 lg:order-1"
            >
              <div>
                <label className="block mb-1 font-medium">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  New Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  disabled={loading}
                />
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 text-white shadow-md"
                >
                  Save Changes
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading}
                  className="shadow-md"
                >
                  Delete Account
                </Button>
              </div>
            </form>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}