import Image from "next/image";
import { LoginForm } from "@/components/admin/login-form";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <Image src="/Logo-3.webp" alt="" width={40} height={40} className="h-10 w-10" />
          <p className="mt-4 text-lg font-semibold text-zinc-900">Panel de administración</p>
          <p className="mt-1 text-sm text-zinc-500">Laura Senmache Negocios Inmobiliarios</p>
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-8 shadow-[0_1px_3px_rgba(28,33,41,0.06)]">
          <LoginForm />
        </div>

        <div className="mt-6 rounded-xl bg-petroleo/5 p-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-petroleo">
            Cuenta de prueba (portfolio)
          </p>
          <p className="mt-1 text-xs text-zinc-600">
            admin@lsnegocios.com.ar &middot; LSNegocios2026
          </p>
        </div>
      </div>
    </div>
  );
}
