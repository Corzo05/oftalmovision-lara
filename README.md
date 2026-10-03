# Proyecto Web

Este proyecto está construido con un enfoque en rendimiento y simplicidad, utilizando las siguientes tecnologías:

*   **Astro:** Framework js principal para la generación del sitio.
*   **TypeScript:** Para un tipado seguro y mejor experiencia de desarrollo.
*   **Tailwind CSS:** Para el manejo rápido y responsivo de los estilos.
*   **Vue.js:** (Configurado e integrado para futuros componentes interactivos complejos, aunque no se está utilizando activamente por el momento).

## Variables de Entorno

Para que la funcionalidad de envío de correos (a través de Resend) opere correctamente en su entorno local, debe crear el `.env` en la raíz del proyecto con las siguientes keys:

```env
RESEND_API_KEY=su_clave_de_api_aqui
EMAIL_DESTINATARIO=correo_destino@tudominio.com
```

## Comandos

*   `npm run dev` - Para iniciar el servidor de desarrollo local.
*   `npm run build` - Para construir el proyecto para producción.
