import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

type SystemCheck = {
  is_windows: boolean;
  is_64bit: boolean;
  is_win10_or_later: boolean;
};

function AdminCheck() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [system, setSystem] = useState<SystemCheck | null>(null);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const result = await invoke<boolean>("is_user_admin");
        setIsAdmin(result);
      } catch (e) {
        console.error("Error checking admin:", e);
      }
    }
    async function checkSystem() {
      try {
        const info = await invoke<SystemCheck>("system_check");
        setSystem(info);
      } catch (e) {
        console.error("Error checking system:", e);
      }
    }
    checkAdmin();
    checkSystem();
  }, []);

  return (
    <div>
      {isAdmin === null && <p>Checking admin status...</p>}
      {isAdmin === true && <p>User is admin ✅</p>}
      {isAdmin === false && <p>User is not admin ❌</p>}
      {system === null && <p>Checking system...</p>}
      {system && (
        <>
          <p>Is Windows: {system.is_windows ? "Yes" : "No"}</p>
          <p>Is 64-bit: {system.is_64bit ? "Yes" : "No"}</p>
          <p>
            Is Windows 10 or later: {system.is_win10_or_later ? "Yes" : "No"}
          </p>
        </>
      )}
    </div>
  );
}

export default AdminCheck;
