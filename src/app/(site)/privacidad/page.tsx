import type { Metadata } from "next";
import { Reveal } from "@/components/site/reveal";
import { SITE, pageOpenGraph } from "@/lib/constants";

const DESCRIPTION =
  "Cómo Laura Senmache Negocios Inmobiliarios trata los datos que recibe a través de este sitio.";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: DESCRIPTION,
  alternates: { canonical: "/privacidad" },
  openGraph: { ...pageOpenGraph("Política de Privacidad", DESCRIPTION), url: "/privacidad" },
};

const linkClass = "text-petroleo underline underline-offset-2 transition-colors duration-150 ease-out hover:text-petroleo-dark";

export default function PrivacidadPage() {
  return (
    <div className="pb-24">
      <div className="bg-piedra/30 py-20">
        <div className="mx-auto max-w-7xl px-6 text-center sm:px-10">
          <Reveal>
            <p className="font-utility text-[12px] uppercase tracking-[0.24em] text-petroleo">
              Privacidad
            </p>
            <h1 className="mt-3 font-display text-4xl text-grafito sm:text-5xl">
              Política de Privacidad
            </h1>
            <p className="mx-auto mt-3 max-w-md font-body text-grafito/60">
              {DESCRIPTION}
            </p>
          </Reveal>
        </div>
      </div>

      <Reveal delay={100} className="mx-auto mt-16 max-w-3xl space-y-12 px-6 font-body text-[15px] leading-relaxed text-grafito/70 sm:px-10">
        <section>
          <h2 className="font-display text-2xl text-grafito">Responsable y finalidad</h2>
          <p className="mt-4">
            Esta Política de Privacidad explica cómo {SITE.name} (&ldquo;LS&rdquo;, &ldquo;nosotros&rdquo;) trata
            los datos que recibe a través de este sitio, operado desde Rosario, Argentina.
          </p>
          <p className="mt-4">
            Utilizamos los datos que nos compartís en este sitio con una finalidad concreta: responder
            tus consultas sobre propiedades y servicios inmobiliarios, y gestionar la relación comercial
            que eventualmente surja de ellas.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-grafito">Formularios y contacto</h2>
          <p className="mt-4">
            Cuando completás voluntariamente un formulario de contacto en este sitio &mdash;por ejemplo,
            para consultar por una propiedad o pedir información general&mdash;, podemos recibir:
          </p>
          <ul className="mt-4 list-disc space-y-1.5 pl-5">
            <li>tu nombre;</li>
            <li>un teléfono o email de contacto;</li>
            <li>el contenido de tu consulta;</li>
            <li>la propiedad por la que consultás, cuando el formulario se envía desde su ficha.</li>
          </ul>
          <p className="mt-4">
            Usamos estos datos exclusivamente para responderte y, si corresponde, dar curso a la consulta
            u operación que iniciaste. No los utilizamos con otros fines ni los cedemos a terceros con
            fines publicitarios.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-grafito">Microsoft Clarity</h2>
          <p className="mt-4">
            Este sitio utiliza{" "}
            <a href="https://clarity.microsoft.com/" target="_blank" rel="noopener noreferrer" className={linkClass}>
              Microsoft Clarity
            </a>
            , una herramienta de analítica que nos ayuda a entender cómo se usa el sitio y a mejorar la
            experiencia de navegación. Clarity analiza de forma agregada aspectos como qué páginas se
            visitan, cómo se recorre el sitio, en qué se hace clic, cómo se hace scroll, y puede generar
            representaciones de sesiones de uso para detectar problemas de usabilidad.
          </p>
          <p className="mt-4">
            Para esto, Clarity puede utilizar cookies y otros identificadores que permiten reconocer
            visitas y generar estas estadísticas de uso. No accedemos a través de esta herramienta a
            contraseñas ni a información sensible: los campos de formulario de este tipo quedan
            enmascarados automáticamente.
          </p>
          <p className="mt-4">
            Podés consultar cómo Microsoft trata estos datos en su{" "}
            <a
              href="https://privacy.microsoft.com/privacystatement"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              Declaración de privacidad
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-grafito">Cookies</h2>
          <p className="mt-4">Este sitio utiliza una cantidad mínima de cookies:</p>
          <ul className="mt-4 list-disc space-y-1.5 pl-5">
            <li>
              Una cookie técnica propia, necesaria para evitar el reenvío accidental o repetido del
              formulario de contacto durante unos segundos después de enviarlo.
            </li>
            <li>Las cookies que Microsoft Clarity pueda utilizar para su funcionamiento de analítica.</li>
          </ul>
          <p className="mt-4">
            No utilizamos cookies de publicidad ni de seguimiento de terceros con fines comerciales.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-grafito">Conservación y proveedores</h2>
          <p className="mt-4">
            Conservamos los datos de tus consultas el tiempo necesario para responderte y gestionar la
            relación comercial correspondiente.
          </p>
          <p className="mt-4">
            Para operar este sitio y prestar nuestros servicios utilizamos proveedores tecnológicos
            (como los servicios de hosting, base de datos y analítica mencionados en esta política), que
            procesan datos en nuestro nombre. No compartimos tus datos con terceros para fines de
            marketing.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-grafito">Tus derechos y contacto</h2>
          <p className="mt-4">
            Este sitio opera en Rosario, Argentina, y esta política se enmarca en la normativa argentina
            de protección de datos personales (Ley 25.326).
          </p>
          <p className="mt-4">
            Si querés consultar, corregir o eliminar los datos que nos compartiste, o tenés alguna duda
            sobre esta política, podés escribirnos a{" "}
            <a href={`mailto:${SITE.email}`} className={linkClass}>
              {SITE.email}
            </a>
            .
          </p>
        </section>
      </Reveal>
    </div>
  );
}
