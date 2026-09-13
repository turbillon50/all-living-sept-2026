import type { Metadata } from "next";
import { LegalShell, H2 } from "../_legal/shell";

export const metadata: Metadata = {
  title: "Aviso de privacidad",
  description:
    "Qué datos pedimos en All Living, para qué los usamos, con quién se comparten y cómo puedes darlos de baja.",
};

export default function Privacidad() {
  return (
    <LegalShell titulo="Aviso de privacidad" actualizado="12 de septiembre de 2026">
      <p>
        All Living es una plataforma operada por <b>All Global Holding LLC</b> (en adelante, “nosotros”).
        Este aviso explica, en español simple, qué datos recogemos, para qué los usamos y qué puedes
        pedirnos que hagamos con ellos.
      </p>

      <H2>Qué datos recogemos</H2>
      <p>
        Cuando entras con <b>Google</b> o con <b>X</b>, el proveedor nos comparte únicamente tu{" "}
        <b>nombre</b>, tu <b>correo electrónico</b> y tu <b>foto de perfil</b>. Nada más. No recibimos tu
        contraseña, no podemos publicar en tu nombre, no leemos tus mensajes y no vemos tus contactos.
      </p>
      <p>
        Además guardamos lo que tú decides escribir dentro de la plataforma: las preferencias de tu
        cuenta y la información de las propiedades o experiencias que registras o consultas.
      </p>

      <H2>Para qué los usamos</H2>
      <p>
        Para identificarte al entrar, para mantener tu sesión abierta, para mostrarte lo tuyo y no lo de
        alguien más, y para escribirte si algo de tu cuenta lo necesita. No vendemos tus datos ni los
        rentamos a terceros, y no los usamos para publicidad de otras empresas.
      </p>

      <H2>Con quién se comparten</H2>
      <p>Solo con los servicios que hacen funcionar la plataforma, y solo con lo mínimo que cada uno necesita:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li><b>Clerk</b> — gestiona el inicio de sesión y tu identidad.</li>
        <li><b>Neon</b> — la base de datos donde vive la información de tu cuenta.</li>
        <li><b>Vercel</b> — la infraestructura donde corre el sitio.</li>
      </ul>
      <p>
        Estos proveedores procesan datos por encargo nuestro y bajo sus propios compromisos de
        seguridad. Fuera de ellos, no compartimos tu información con nadie, salvo que una autoridad
        competente nos lo requiera por ley.
      </p>

      <H2>Cuánto tiempo los conservamos</H2>
      <p>
        Mientras tengas cuenta activa. Si la das de baja, borramos tus datos personales salvo aquello
        que debamos conservar por obligación legal.
      </p>

      <H2>Tus derechos</H2>
      <p>
        Puedes pedirnos en cualquier momento <b>acceder</b> a tus datos, <b>corregirlos</b>,{" "}
        <b>cancelarlos</b> u <b>oponerte</b> a que los usemos, así como revocar el consentimiento que
        nos diste. Escríbenos y lo resolvemos.
      </p>
      <p>
        También puedes desconectar All Living directamente desde tu cuenta de Google o de X cuando
        quieras, sin pedirnos permiso.
      </p>

      <H2>Cookies</H2>
      <p>
        Usamos únicamente las cookies necesarias para mantener tu sesión iniciada. No usamos cookies
        de publicidad ni de seguimiento de terceros.
      </p>

      <H2>Menores de edad</H2>
      <p>All Living está dirigida a personas mayores de 18 años. No recabamos datos de menores a sabiendas.</p>

      <H2>Cambios a este aviso</H2>
      <p>
        Si cambia algo relevante lo publicamos aquí y actualizamos la fecha de arriba. Si el cambio
        afecta cómo tratamos tus datos, te avisamos por correo.
      </p>

      <H2>Contacto</H2>
      <p>
        Para cualquier duda o para ejercer tus derechos:{" "}
        <a className="underline underline-offset-4" href="mailto:firstcontact@allglobalholding.com">
          firstcontact@allglobalholding.com
        </a>
      </p>
    </LegalShell>
  );
}
