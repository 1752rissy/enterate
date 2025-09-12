// Email service for sending notifications
export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
}

export const createAdminApprovalEmail = (userName: string, userEmail: string): EmailTemplate => {
  return {
    to: userEmail,
    subject: '🎉 ¡Tu solicitud de administrador ha sido aprobada! - Entérate',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6; 
              color: #333; 
              margin: 0;
              padding: 0;
              background-color: #f8fafc;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
              border-radius: 12px 12px 0 0; 
            }
            .content { 
              background: white; 
              padding: 40px 30px; 
              border-radius: 0 0 12px 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .button { 
              display: inline-block; 
              background: #28a745; 
              color: white; 
              padding: 15px 30px; 
              text-decoration: none; 
              border-radius: 8px; 
              margin: 20px 0;
              font-weight: 600;
              font-size: 16px;
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              color: #666; 
              font-size: 14px; 
            }
            .success-icon { 
              font-size: 64px; 
              margin-bottom: 20px; 
            }
            .feature-list {
              background: #f8f9fa;
              padding: 25px;
              border-radius: 8px;
              margin: 25px 0;
            }
            .feature-item {
              display: flex;
              align-items: center;
              margin: 12px 0;
              font-size: 16px;
            }
            .feature-icon {
              margin-right: 12px;
              font-size: 20px;
            }
            .highlight-box {
              background: #e3f2fd;
              border-left: 4px solid #2196f3;
              padding: 20px;
              margin: 20px 0;
              border-radius: 0 8px 8px 0;
            }
            h1 { margin: 0; font-size: 28px; }
            h2 { color: #2c3e50; margin-top: 0; }
            h3 { color: #34495e; }
            ul { padding-left: 20px; }
            li { margin: 8px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="success-icon">🎉</div>
              <h1>¡Felicitaciones ${userName}!</h1>
              <p style="font-size: 18px; margin: 10px 0 0 0;">Tu solicitud de administrador ha sido aprobada</p>
            </div>
            
            <div class="content">
              <h2>🚀 ¡Bienvenido al equipo de administradores de Entérate!</h2>
              
              <p style="font-size: 16px;">Nos complace informarte que tu solicitud para convertirte en <strong>administrador</strong> de la plataforma Entérate ha sido <strong>aprobada</strong> por nuestro equipo de moderación.</p>
              
              <div class="highlight-box">
                <h3 style="margin-top: 0; color: #1976d2;">✨ ¡Ya puedes gestionar eventos!</h3>
                <p style="margin-bottom: 0;">En tu próximo inicio de sesión, tendrás acceso completo a las herramientas de administración.</p>
              </div>
              
              <h3>🎯 ¿Qué puedes hacer ahora como administrador?</h3>
              <div class="feature-list">
                <div class="feature-item">
                  <span class="feature-icon">📅</span>
                  <span><strong>Crear eventos:</strong> Publica eventos únicos para tu comunidad</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">✏️</span>
                  <span><strong>Editar eventos:</strong> Actualiza información y detalles de tus eventos</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">🗑️</span>
                  <span><strong>Eliminar eventos:</strong> Remueve eventos que ya no sean relevantes</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">👥</span>
                  <span><strong>Gestionar asistentes:</strong> Controla la capacidad y lista de participantes</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">🏷️</span>
                  <span><strong>Categorizar eventos:</strong> Organiza eventos por temas y etiquetas</span>
                </div>
              </div>
              
              <h3>📋 Próximos pasos para comenzar:</h3>
              <ol style="font-size: 16px; line-height: 1.8;">
                <li><strong>Inicia sesión</strong> en la plataforma Entérate</li>
                <li><strong>Busca la pestaña "Mis Eventos"</strong> en tu panel de usuario</li>
                <li><strong>Explora las herramientas</strong> de creación de eventos</li>
                <li><strong>¡Crea tu primer evento!</strong> y compártelo con la comunidad</li>
              </ol>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${window.location?.origin || 'https://enterate.com'}" class="button">🎯 Acceder a Entérate</a>
              </div>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h4 style="margin-top: 0; color: #856404;">💡 Consejos para administradores exitosos:</h4>
                <ul style="margin-bottom: 0; color: #856404;">
                  <li>Incluye toda la información relevante en tus eventos (fecha, hora, ubicación, descripción)</li>
                  <li>Usa imágenes atractivas y de alta calidad para captar la atención</li>
                  <li>Categoriza correctamente tus eventos para facilitar su descubrimiento</li>
                  <li>Responde rápidamente a las preguntas y comentarios de los asistentes</li>
                  <li>Promociona tus eventos en redes sociales para mayor alcance</li>
                </ul>
              </div>
              
              <p style="font-size: 16px;">Si tienes alguna pregunta sobre cómo usar las herramientas de administración o necesitas ayuda, no dudes en contactar a nuestro equipo de soporte.</p>
              
              <p style="font-size: 18px; font-weight: 600; color: #2c3e50; text-align: center; margin-top: 30px;">
                ¡Esperamos ver los increíbles eventos que vas a crear! 🌟
              </p>
            </div>
            
            <div class="footer">
              <p>Este correo fue enviado automáticamente por el sistema Entérate</p>
              <p style="margin: 5px 0;">📧 No respondas a este correo - es una cuenta no monitoreada</p>
              <p style="font-weight: 600;">© 2024 Entérate - Plataforma de Eventos Comunitarios</p>
            </div>
          </div>
        </body>
      </html>
    `
  };
};

export const createAdminRejectionEmail = (userName: string, userEmail: string): EmailTemplate => {
  return {
    to: userEmail,
    subject: '📋 Actualización sobre tu solicitud de administrador - Entérate',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6; 
              color: #333; 
              margin: 0;
              padding: 0;
              background-color: #f8fafc;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            .header { 
              background: linear-gradient(135deg, #ff7675 0%, #fd79a8 100%); 
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
              border-radius: 12px 12px 0 0; 
            }
            .content { 
              background: white; 
              padding: 40px 30px; 
              border-radius: 0 0 12px 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .button { 
              display: inline-block; 
              background: #007bff; 
              color: white; 
              padding: 15px 30px; 
              text-decoration: none; 
              border-radius: 8px; 
              margin: 20px 0;
              font-weight: 600;
              font-size: 16px;
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              color: #666; 
              font-size: 14px; 
            }
            .info-box {
              background: #f8f9fa;
              border-left: 4px solid #6c757d;
              padding: 20px;
              margin: 20px 0;
              border-radius: 0 8px 8px 0;
            }
            h1 { margin: 0; font-size: 28px; }
            h2 { color: #2c3e50; margin-top: 0; }
            h3 { color: #34495e; }
            ul { padding-left: 20px; }
            li { margin: 8px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Hola ${userName}</h1>
              <p style="font-size: 18px; margin: 10px 0 0 0;">Actualización sobre tu solicitud de administrador</p>
            </div>
            
            <div class="content">
              <h2>📋 Estado de tu solicitud</h2>
              
              <p style="font-size: 16px;">Gracias por tu interés en convertirte en administrador de la plataforma <strong>Entérate</strong>.</p>
              
              <div class="info-box">
                <p style="margin: 0; font-weight: 600;">Después de revisar tu solicitud, en este momento no podemos aprobar tu acceso como administrador.</p>
              </div>
              
              <p>Esto puede deberse a varios factores como:</p>
              <ul>
                <li>Capacidad actual del equipo de administradores</li>
                <li>Requisitos específicos de experiencia no cumplidos</li>
                <li>Necesidad de mayor participación en la comunidad</li>
                <li>Políticas internas de la plataforma</li>
              </ul>
              
              <h3>🔄 ¿Qué puedes hacer ahora?</h3>
              <ul style="font-size: 16px;">
                <li><strong>Continúa participando</strong> activamente en la plataforma como usuario</li>
                <li><strong>Asiste a eventos</strong> y construye tu reputación en la comunidad</li>
                <li><strong>Interactúa</strong> con otros usuarios y organizadores</li>
                <li><strong>Solicita nuevamente</strong> en el futuro cuando tengas más experiencia</li>
              </ul>
              
              <h3>🌟 Recuerda que como usuario registrado aún puedes:</h3>
              <ul style="font-size: 16px;">
                <li>Ver y participar en todos los eventos disponibles</li>
                <li>Comentar y dar me gusta a eventos que te interesen</li>
                <li>Conectar con otros miembros de la comunidad</li>
                <li>Recibir notificaciones sobre eventos de tu interés</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${window.location?.origin || 'https://enterate.com'}" class="button">🎯 Explorar Eventos</a>
              </div>
              
              <p style="font-size: 16px;">Si tienes preguntas específicas sobre esta decisión o quieres conocer más sobre los requisitos para ser administrador, puedes contactar a nuestro equipo de moderación.</p>
              
              <p style="font-size: 16px; font-weight: 600; color: #2c3e50; text-align: center; margin-top: 30px;">
                ¡Gracias por ser parte de la comunidad Entérate! 🤝
              </p>
            </div>
            
            <div class="footer">
              <p>Este correo fue enviado automáticamente por el sistema Entérate</p>
              <p style="margin: 5px 0;">📧 No respondas a este correo - es una cuenta no monitoreada</p>
              <p style="font-weight: 600;">© 2024 Entérate - Plataforma de Eventos Comunitarios</p>
            </div>
          </div>
        </body>
      </html>
    `
  };
};

// Simulate email sending with enhanced visibility
export const sendEmail = async (emailData: EmailTemplate): Promise<boolean> => {
  try {
    console.log('🚀 INICIANDO ENVÍO DE EMAIL...');
    console.log('📧 Destinatario:', emailData.to);
    console.log('📋 Asunto:', emailData.subject);
    
    // Show immediate visual feedback
    const emailNotification = document.createElement('div');
    emailNotification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      max-width: 350px;
      animation: slideIn 0.3s ease-out;
    `;
    
    emailNotification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 18px;">📧</span>
        <div>
          <div style="font-weight: 600;">Enviando email...</div>
          <div style="font-size: 12px; opacity: 0.9;">A: ${emailData.to}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(emailNotification);
    
    // Add animation keyframes
    if (!document.getElementById('email-animations')) {
      const style = document.createElement('style');
      style.id = 'email-animations';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Store email in localStorage for demo purposes
    const sentEmails = JSON.parse(localStorage.getItem('enterate-sent-emails') || '[]');
    const emailRecord = {
      ...emailData,
      sentAt: new Date().toISOString(),
      id: Date.now().toString(),
      status: 'sent'
    };
    sentEmails.push(emailRecord);
    localStorage.setItem('enterate-sent-emails', JSON.stringify(sentEmails));
    
    // Update notification to success
    emailNotification.style.background = '#4CAF50';
    emailNotification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 18px;">✅</span>
        <div>
          <div style="font-weight: 600;">Email enviado exitosamente</div>
          <div style="font-size: 12px; opacity: 0.9;">A: ${emailData.to}</div>
        </div>
      </div>
    `;
    
    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('📧 Email Enviado - Entérate', {
        body: `Notificación enviada a ${emailData.to}`,
        icon: '/favicon.ico'
      });
    }
    
    // Log success details
    console.log('✅ EMAIL ENVIADO EXITOSAMENTE');
    console.log('📄 Email almacenado en localStorage con ID:', emailRecord.id);
    console.log('🕒 Timestamp:', emailRecord.sentAt);
    
    // Remove notification after delay
    setTimeout(() => {
      emailNotification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (emailNotification.parentNode) {
          emailNotification.parentNode.removeChild(emailNotification);
        }
      }, 300);
    }, 4000);
    
    return true;
  } catch (error) {
    console.error('❌ ERROR ENVIANDO EMAIL:', error);
    
    // Show error notification
    const errorNotification = document.createElement('div');
    errorNotification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      max-width: 350px;
    `;
    
    errorNotification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 18px;">❌</span>
        <div>
          <div style="font-weight: 600;">Error enviando email</div>
          <div style="font-size: 12px; opacity: 0.9;">Inténtalo de nuevo</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(errorNotification);
    
    setTimeout(() => {
      if (errorNotification.parentNode) {
        errorNotification.parentNode.removeChild(errorNotification);
      }
    }, 5000);
    
    return false;
  }
};

// Get sent emails for demo purposes
export const getSentEmails = () => {
  return JSON.parse(localStorage.getItem('enterate-sent-emails') || '[]');
};

// Request notification permission on page load
export const requestNotificationPermission = () => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
};

// Initialize email service
if (typeof window !== 'undefined') {
  requestNotificationPermission();
}