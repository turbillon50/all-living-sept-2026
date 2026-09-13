import type { Metadata } from "next";
import { LegalShell, H2 } from "../_legal/shell";

export const metadata: Metadata = {
  title: "Términos del servicio",
  description:
    "Las reglas para usar All Living: qué ofrecemos, qué esperamos de ti y hasta dónde llega nuestra responsabilidad.",
};

export default function Terminos() {
  return (
    <LegalShell titulo="Términos del servicio" actualizado="12 de septiembre de 2026">
      <p>
        Al crear una cuenta o usar All Living aceptas estos términos. La plataforma es operada por{" "}
        <b>Colectivo Más, S.A. de C.V.</b>, entidad operadora actual de la plataforma en México. La estructura corporativa podrá actualizarse y se informará en estos términos antes de que el cambio produzca efectos para los usuarios.
      </p>

      <H2>Qué es All Living</H2>
      <p>
        Una plataforma para descubrir, organizar y compartir propiedades y experiencias de vida. Te
        damos las herramientas y la información; las decisiones sobre cualquier propiedad las tomas tú.
      </p>

      <H2>Pagos y reservas</H2>
      <p>
        All Living puede facilitar reservas y cobros mediante proveedores de pago autorizados. Cuando la arquitectura aplicable lo permita, el cargo de alojamiento se atribuye a la cuenta conectada del propietario y All Living cobra separadamente su comisión de plataforma. Antes de confirmar una reserva se muestran el precio total, impuestos, comisiones y política de cancelación aplicable.
      </p>

      <H2>Garantía All Living</H2>
      <p>
        Algunas reservas elegibles pueden mostrar el sello Garantía All Living. Si un alojamiento confirmado queda indisponible por una incidencia operativa cubierta, All Living activará su protocolo de reubicación y buscará una alternativa de categoría equivalente o superior, priorizando la zona originalmente reservada y sujeto a disponibilidad, límites y condiciones de la reserva.
      </p>
      <p>
        La garantía no es un seguro y puede excluir eventos generales de fuerza mayor, evacuaciones por huracán, cierres de destino, actos de autoridad, conflictos y otros eventos inevitables. En esos casos All Living mantendrá asistencia operativa y gestionará las alternativas, cambios o devoluciones que correspondan conforme a la reserva y a la ley.
      </p>

      <H2>Tu cuenta</H2>
      <p>
        Puedes entrar con Google o con X. Eres responsable de la cuenta con la que accedes y de lo que
        se haga desde ella. Necesitas ser mayor de 18 años. Los datos que nos des deben ser tuyos y
        verdaderos.
      </p>

      <H2>Uso aceptable</H2>
      <p>No se vale usar All Living para:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>publicar información falsa sobre una propiedad, un precio o una disponibilidad;</li>
        <li>suplantar a otra persona o empresa;</li>
        <li>extraer datos de forma automatizada sin nuestro permiso por escrito;</li>
        <li>intentar vulnerar la seguridad de la plataforma o el acceso de otras cuentas;</li>
        <li>cualquier fin ilegal.</li>
      </ul>
      <p>Si algo de esto ocurre, podemos suspender la cuenta sin aviso previo.</p>

      <H2>Contenido</H2>
      <p>
        Lo que publicas sigue siendo tuyo. Al publicarlo nos das permiso para mostrarlo dentro de la
        plataforma para que el servicio funcione. La marca All Living, el sitio, su diseño y su código
        son nuestros y no se pueden reproducir sin autorización.
      </p>

      <H2>La información no es asesoría</H2>
      <p>
        Los datos, estimaciones y referencias de mercado que veas son informativos. No son asesoría
        inmobiliaria, legal, fiscal ni financiera, y no sustituyen la verificación directa ni la
        opinión de un profesional. Antes de comprar, rentar o invertir, verifica por tu cuenta.
      </p>

      <H2>Disponibilidad</H2>
      <p>
        Hacemos lo posible por mantener el servicio en línea, pero no garantizamos operación
        ininterrumpida. Podemos modificar o descontinuar funciones; si alguna desaparece y te afecta,
        lo avisamos.
      </p>

      <H2>Responsabilidad</H2>
      <p>
        All Living se ofrece tal como está. En la medida que la ley lo permita, no respondemos por
        daños indirectos ni por decisiones que tomes con base en la información de la plataforma.
      </p>

      <H2>Baja</H2>
      <p>
        Puedes cerrar tu cuenta cuando quieras escribiéndonos. También puedes revocar el acceso desde
        tu cuenta de Google o de X directamente.
      </p>

      <H2>Cambios</H2>
      <p>
        Si cambiamos estos términos, publicamos la nueva versión aquí con su fecha. Seguir usando la
        plataforma después de un cambio significa que lo aceptas.
      </p>

      <H2>Contacto</H2>
      <p>
        <a className="underline underline-offset-4" href="mailto:firstcontact@allglobalholding.com">
          firstcontact@allglobalholding.com
        </a>
      </p>
    </LegalShell>
  );
}
