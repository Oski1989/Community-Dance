import { supabase } from '@/lib/supabase/client';
import { emailService } from '@/services/email.service';

export class NotificationService {
  /**
   * Create an in-app notification and optionally send an email.
   */
  static async createNotification(
    userId: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    userEmail?: string
  ) {
    // 1. In-App Notification
    await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type,
    });

    // 2. Email Notification (if email provided)
    if (userEmail) {
      await emailService.sendEmail(
        userEmail,
        title,
        `<div style="font-family: sans-serif; padding: 20px;">
          <h2>${title}</h2>
          <p>${message}</p>
          <p style="color: #666; font-size: 12px;">Equipo de Plaza Dance</p>
        </div>`
      );
    }
  }

  static async notifyReservationConfirmed(userId: string, className: string, dateStr: string, email?: string) {
    return this.createNotification(
      userId,
      '¡Reserva Confirmada!',
      `Has reservado plaza para la clase "${className}" del ${dateStr}.`,
      'success',
      email
    );
  }

  static async notifyWaitlistPromoted(userId: string, className: string, email?: string) {
    return this.createNotification(
      userId,
      '¡Plaza Disponible! Promocionado desde lista de espera',
      `Se ha liberado un cupo y tu reserva para "${className}" ha sido CONFIRMADA automáticamente.`,
      'success',
      email
    );
  }

  static async notifyPaymentReceived(userId: string, amount: number, pending: number, email?: string) {
    const text = pending > 0
      ? `Hemos registrado tu pago de ${amount}€. Saldo pendiente: ${pending}€.`
      : `Hemos recibido tu pago completo de ${amount}€. ¡Gracias!`;

    return this.createNotification(userId, 'Comprobante de Pago', text, 'info', email);
  }

  static async notifyQuestApproved(userId: string, questTitle: string, points: number, email?: string) {
    return this.createNotification(
      userId,
      '¡Reto Aprobado!',
      `Tu entregable para "${questTitle}" ha sido aprobado por el profesor. Has ganado ${points} puntos.`,
      'success',
      email
    );
  }
}
