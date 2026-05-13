"""
Management command to send checkout reminder emails to guests.
Run this with a cron job twice daily:
  - Morning of checkout day (e.g. 8:00 AM)
  - Day before checkout (e.g. 6:00 PM)

Cron setup (in terminal: crontab -e):
  0 8  * * * /path/to/venv/bin/python /path/to/manage.py send_checkout_reminders --type today
  0 18 * * * /path/to/venv/bin/python /path/to/manage.py send_checkout_reminders --type tomorrow
"""

from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.utils import timezone
from django.conf import settings
from booking.models import Booking
from customer.models import Customer
from room.models import Room
from users.models import Hotel
from api.models import EmailLog
import datetime


class Command(BaseCommand):
    help = "Send checkout reminder emails to guests checking out today or tomorrow"

    def add_arguments(self, parser):
        parser.add_argument(
            "--type",
            type=str,
            choices=["today", "tomorrow"],
            required=True,
            help="Send reminders for guests checking out 'today' or 'tomorrow'",
        )

    def handle(self, *args, **options):
        reminder_type = options["type"]
        today = timezone.now().date()

        if reminder_type == "today":
            target_date = today
            subject_prefix = "⏰ Checkout Reminder — Today"
        else:
            target_date = today + datetime.timedelta(days=1)
            subject_prefix = "📅 Checkout Reminder — Tomorrow"

        # Get all bookings with checkout on target date
        bookings = Booking.objects.filter(check_out=target_date)

        if not bookings.exists():
            self.stdout.write(
                self.style.WARNING(f"No checkouts found for {target_date}")
            )
            return

        sent = 0
        failed = 0

        for booking in bookings:
            try:
                customer = Customer.objects.get(id=booking.customer_id)
                room = Room.objects.get(id=booking.room_id)
                hotel = Hotel.objects.get(id=booking.hotel_id)

                if not customer.email:
                    self.stdout.write(
                        self.style.WARNING(
                            f"No email for customer {customer.first_name} {customer.last_name}, skipping."
                        )
                    )
                    continue

                subject = f"{subject_prefix} | {hotel.name}"
                message = build_email_message(
                    customer=customer,
                    room=room,
                    hotel=hotel,
                    booking=booking,
                    reminder_type=reminder_type,
                )

                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[customer.email],
                    html_message=build_html_email(
                        customer=customer,
                        room=room,
                        hotel=hotel,
                        booking=booking,
                        reminder_type=reminder_type,
                    ),
                    fail_silently=False,
                )

                # Log the email
                EmailLog.objects.create(
                    recipient_email=customer.email,
                    recipient_name=f"{customer.first_name} {customer.last_name}",
                    email_type=f"checkout_{reminder_type}",
                    subject=subject,
                    hotel_name=hotel.name,
                    booking_id=booking.id,
                    status='sent',
                )

                sent += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f"✅ Reminder sent to {customer.email} ({customer.first_name} {customer.last_name})"
                    )
                )

            except Exception as e:
                failed += 1
                # Log failed email
                try:
                    EmailLog.objects.create(
                        recipient_email=customer.email if customer else "unknown",
                        recipient_name=f"{customer.first_name} {customer.last_name}" if customer else "unknown",
                        email_type=f"checkout_{reminder_type}",
                        subject=subject_prefix,
                        hotel_name=hotel.name if hotel else "",
                        booking_id=booking.id,
                        status='failed',
                        error_message=str(e),
                    )
                except Exception:
                    pass
                self.stdout.write(
                    self.style.ERROR(f"❌ Failed for booking #{booking.id}: {e}")
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone. Sent: {sent} | Failed: {failed} | Total: {sent + failed}"
            )
        )


def build_email_message(customer, room, hotel, booking, reminder_type):
    """Plain text fallback email."""
    when = "today" if reminder_type == "today" else "tomorrow"
    return f"""
Dear {customer.first_name} {customer.last_name},

This is a friendly reminder that your checkout is scheduled for {when}.

Booking Details:
----------------
Hotel       : {hotel.name}
Room        : {room.name}
Check-in    : {booking.check_in}
Check-out   : {booking.check_out}
Booking ID  : #{booking.id}

Please ensure you complete checkout by 11:00 AM.

If you'd like to extend your stay, please contact our front desk as soon as possible.

We hope you had a wonderful stay at {hotel.name}.

Warm regards,
The {hotel.name} Team
Hotel Hive Platform
"""


def build_html_email(customer, room, hotel, booking, reminder_type):
    """Beautiful HTML email matching Hotel Hive brand."""
    when = "Today" if reminder_type == "today" else "Tomorrow"
    when_lower = "today" if reminder_type == "today" else "tomorrow"
    icon = "⏰" if reminder_type == "today" else "📅"

    return f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Checkout Reminder</title>
</head>
<body style="margin:0;padding:0;background:#F4F1E8;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F1E8;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#1A1A1A;border-radius:16px 16px 0 0;padding:28px 36px;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:#2A2A2A;border-radius:10px;padding:8px 10px;vertical-align:middle;">
                    <span style="font-size:18px;">🏨</span>
                  </td>
                  <td style="padding-left:12px;vertical-align:middle;">
                    <span style="font-family:Georgia,serif;font-size:22px;color:#fff;font-weight:500;">
                      Hotel <span style="background:#F5C842;color:#1A1A1A;padding:0 5px;border-radius:4px;">Hive</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero banner -->
          <tr>
            <td style="background:#F5C842;padding:32px 36px;text-align:center;">
              <div style="font-size:40px;margin-bottom:10px;">{icon}</div>
              <h1 style="font-family:Georgia,serif;font-size:28px;color:#1A1A1A;margin:0 0 8px;font-weight:500;">
                Checkout is {when}
              </h1>
              <p style="font-size:15px;color:#3A3A2A;margin:0;">
                We hope you had a wonderful stay, {customer.first_name}!
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#fff;padding:36px;">

              <p style="font-size:15px;color:#333;line-height:1.7;margin:0 0 24px;">
                Dear <strong>{customer.first_name} {customer.last_name}</strong>,<br><br>
                This is a friendly reminder that your checkout at <strong>{hotel.name}</strong>
                is scheduled for <strong>{when_lower}</strong>.
                Please ensure you complete checkout by <strong>11:00 AM</strong>.
              </p>

              <!-- Booking details card -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#FAFAF7;border:1px solid #EDE8D8;border-radius:12px;overflow:hidden;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid #EDE8D8;">
                    <span style="font-size:11px;font-weight:500;color:#888;text-transform:uppercase;letter-spacing:0.05em;">
                      Booking summary
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;font-size:14px;color:#888;width:40%;">Hotel</td>
                        <td style="padding:8px 0;font-size:14px;color:#1A1A1A;font-weight:500;">{hotel.name}</td>
                      </tr>
                      <tr style="border-top:1px solid #F4F1E8;">
                        <td style="padding:8px 0;font-size:14px;color:#888;">Room</td>
                        <td style="padding:8px 0;font-size:14px;color:#1A1A1A;font-weight:500;">{room.name}</td>
                      </tr>
                      <tr style="border-top:1px solid #F4F1E8;">
                        <td style="padding:8px 0;font-size:14px;color:#888;">Check-in</td>
                        <td style="padding:8px 0;font-size:14px;color:#1A1A1A;font-weight:500;">{booking.check_in}</td>
                      </tr>
                      <tr style="border-top:1px solid #F4F1E8;">
                        <td style="padding:8px 0;font-size:14px;color:#888;">Check-out</td>
                        <td style="padding:8px 0;font-size:14px;color:#1A1A1A;font-weight:500;">
                          <span style="background:#FEF9EC;color:#B89A00;padding:2px 10px;border-radius:20px;">
                            {booking.check_out}
                          </span>
                        </td>
                      </tr>
                      <tr style="border-top:1px solid #F4F1E8;">
                        <td style="padding:8px 0;font-size:14px;color:#888;">Booking ID</td>
                        <td style="padding:8px 0;font-size:14px;color:#888;">#{booking.id}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Note -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#FFF8E1;border:1px solid #F5C842;border-radius:10px;margin-bottom:28px;">
                <tr>
                  <td style="padding:14px 18px;font-size:14px;color:#7A6000;line-height:1.6;">
                    💡 <strong>Need to extend your stay?</strong> Please contact our front desk
                    as soon as possible and we'll do our best to accommodate you.
                  </td>
                </tr>
              </table>

              <p style="font-size:15px;color:#555;line-height:1.7;margin:0;">
                Thank you for choosing <strong>{hotel.name}</strong>. We look forward to
                welcoming you back soon!
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1A1A1A;border-radius:0 0 16px 16px;padding:24px 36px;text-align:center;">
              <p style="font-size:13px;color:rgba(255,255,255,0.4);margin:0 0 6px;">
                {hotel.name} · Powered by Hotel Hive
              </p>
              <p style="font-size:12px;color:rgba(255,255,255,0.25);margin:0;">
                This is an automated reminder. Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
"""