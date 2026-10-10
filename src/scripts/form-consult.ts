import Swal from 'sweetalert2';

export function initFormConsult() {
  const form = document.getElementById('form-consult') as HTMLFormElement | null;
  const submitBtn = document.getElementById('submit-form') as HTMLButtonElement | null;
  const selectDia = document.getElementById('select-dia') as HTMLSelectElement | null;
  const selectHora = document.getElementById('select-hora') as HTMLSelectElement | null;
  const textareaForm = document.getElementById("textarea-form") as HTMLTextAreaElement | null;

  if (!form) return; 

  const slotsLunesViernes = [
    "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM",
    "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM"
  ];

  const slotsSabado = [
    "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", 
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM"
  ];

  let nombreDia = "";

  selectDia?.addEventListener('change', async (e) => {
    const targetSelect = e.target as HTMLSelectElement;
    const fechaISO = targetSelect.value; 
    const selectedOption = targetSelect.options[targetSelect.selectedIndex];
    nombreDia = selectedOption.getAttribute('data-nombre') || '';

    const esSabado = nombreDia.toLowerCase().includes('sábado') || nombreDia.toLowerCase().includes('sabado');
    const horarios = esSabado ? slotsSabado : slotsLunesViernes;

    if (selectHora) {
      selectHora.innerHTML = '<option value="" disabled selected>Consultando disponibilidad...</option>';
      selectHora.disabled = true;
    }

    try {
      const res = await fetch(`/api/booked-slots?fecha=${encodeURIComponent(fechaISO)}`);
      const { bookedSlots } = await res.json();

      if (selectHora) {
        selectHora.innerHTML = '<option value="" disabled selected>Selecciona una hora</option>';

        horarios.forEach(slot => {
          const option = document.createElement('option');
          option.value = slot;

          const isBooked = Array.isArray(bookedSlots) && bookedSlots.includes(slot);
          
          if (isBooked) {
            option.textContent = `${slot} (Ocupado)`;
            option.disabled = true;
          } else {
            option.textContent = slot;
          }

          selectHora.appendChild(option);
        });

        selectHora.disabled = false;
      }
    } catch (err) {
      console.error("Error al obtener disponibilidad:", err);
      if (selectHora) {
        selectHora.innerHTML = '<option value="" disabled selected>Error al cargar horarios</option>';
      }
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (submitBtn) {
      submitBtn.textContent = 'Enviando...';
      submitBtn.disabled = true;
    }

    const formData = new FormData(form);

    const nacionalidad = formData.get('nacionalidad');
    const numCedula = formData.get('cedula');
    const cedulaCompleta = `${nacionalidad}-${numCedula}`;

    const codigoTelf = formData.get('codigo_telf');
    const numTelf = formData.get('telf');
    const telefonoCompleto = `${codigoTelf}-${numTelf}`;

    const data = {
      nombre: formData.get('nombre'),
      cedula: cedulaCompleta,
      telefono: telefonoCompleto,
      email: formData.get('email'),
      nombreDia: nombreDia,
      fecha: formData.get('fecha'),
      hora: formData.get('hora'),
      mensaje: formData.get('message'),
      website: formData.get('website'),
    };

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Cita reservada con éxito',
          showConfirmButton: false,
          showCancelButton: false,
          timer: 4000,
          timerProgressBar: true,
          customClass: {popup: 'rounded-none'}
        });
        form.reset();
        if (selectHora) {
          selectHora.innerHTML = '<option value="" disabled selected>Primero selecciona un día</option>';
          selectHora.disabled = true;
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'No se pudo agendar',
          text: result.error || 'Inténtalo de nuevo más tarde.',
          confirmButtonText: 'Entendido',
          confirmButtonColor: 'var(--skyblue-custom, #0284c7)',
          customClass: {
            popup: 'rounded-none',
            confirmButton: 'rounded-none uppercase tracking-wider font-inter'
          }
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'Hubo un problema de red al intentar agendar la cita.',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: 'var(--skyblue-custom, #0284c7)',
        customClass: {
          popup: 'rounded-none',
          confirmButton: 'rounded-none uppercase tracking-wider font-inter'
        }
      });
    } finally {
      if (submitBtn) {
        submitBtn.textContent = 'Enviar Mensaje';
        submitBtn.disabled = false;
      }
    }
  });

  const anchorServices = document.querySelectorAll('.anchor-service');

  anchorServices.forEach(anchor => {
    anchor.addEventListener("click", function() {
      const h3 = anchor.previousElementSibling?.querySelector('h3');
      if (textareaForm && h3?.textContent) {
        textareaForm.value = "Quisiera agendar una cita para: " + h3.textContent;
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', initFormConsult);
document.addEventListener('astro:page-load', initFormConsult);