import Image from "next/image";
import { LoginForm } from "@/components/admin/login-form";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-[42%] shrink-0 lg:block">
        <Image src="/images/hero/costanera.jpg" alt="" fill sizes="42vw" className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-grafito-dark/90 via-grafito-dark/30 to-grafito-dark/10" />
        <div className="absolute inset-0 flex flex-col justify-between p-10">
          <div className="flex items-center gap-2.5">
            <Image src="/Logo-3.webp" alt="" width={28} height={28} className="h-7 w-7" />
            <span className="font-display text-lg text-blanco-roto" style={{ fontWeight: 480 }}>
              LS Gestión
            </span>
          </div>
          <div className="max-w-sm">
            <p className="font-display text-2xl italic leading-snug text-blanco-roto" style={{ fontWeight: 420 }}>
              &ldquo;Cada operación se cierra con la misma atención que le pondríamos a la nuestra.&rdquo;
            </p>
            <p className="mt-4 font-utility text-[11px] uppercase tracking-[0.14em] text-petroleo-claro">
              Panel de gestión inmobiliaria — Rosario
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-plata px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <Image src="/Logo-3.webp" alt="" width={36} height={36} className="h-9 w-9" />
            <p className="mt-3 font-display text-xl text-grafito" style={{ fontWeight: 480 }}>
              LS Gestión
            </p>
          </div>
          <div className="hidden lg:block">
            <p className="font-utility text-[11px] uppercase tracking-[0.14em] text-petroleo">Panel de gestión</p>
            <h1 className="mt-2 font-display text-[26px] leading-[1.15] text-grafito" style={{ fontWeight: 480 }}>
              Ingresá a tu cuenta
            </h1>
          </div>

          <div className="mt-6 rounded-2xl bg-blanco-roto p-7 ring-1 ring-grafito/[0.06] shadow-[0_16px_40px_-12px_rgba(28,33,41,0.12)]">
            <LoginForm />
          </div>

          <div className="mt-5 rounded-2xl bg-petroleo/[0.06] p-4 text-center">
            <p className="font-utility text-[10px] font-medium uppercase tracking-[0.1em] text-petroleo">
              Cuenta de prueba (portfolio)
            </p>
            <p className="mt-1 text-xs text-grafito/55">admin@lsnegocios.com.ar &middot; LSNegocios2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
