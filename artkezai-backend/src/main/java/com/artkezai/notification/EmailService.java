package com.artkezai.notification;

import com.artkezai.offer.Offer;
import com.artkezai.order.Order;
import com.artkezai.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

	private final JavaMailSender mailSender;

	private static final String FROM_EMAIL = "noreply@artkezai.com";

	public void sendOfferSubmitted(Offer offer) {
		try {
			SimpleMailMessage message = new SimpleMailMessage();
			message.setFrom(FROM_EMAIL);
			message.setTo(offer.getPainting().getArtist().getUser().getEmail());
			message.setSubject("New Offer Received: " + offer.getPainting().getTitle());
			message.setText(String.format(
					"Hello %s,\n\nYou have received a new offer for your painting '%s'.\n\n" +
					"Offer Amount: %s %s\n" +
					"Message: %s\n\n" +
					"Please log in to respond to this offer.\n\nBest regards,\nArtkezai Team",
					offer.getPainting().getArtist().getDisplayName(),
					offer.getPainting().getTitle(),
					offer.getOfferAmount(),
					offer.getCurrency(),
					offer.getBuyerMessage() != null ? offer.getBuyerMessage() : "No message"
			));

			mailSender.send(message);
			log.info("Offer submitted email sent to: {}", offer.getPainting().getArtist().getUser().getEmail());
		} catch (Exception ex) {
			log.error("Failed to send offer submitted email", ex);
		}
	}

	public void sendOfferResponse(Offer offer) {
		try {
			SimpleMailMessage message = new SimpleMailMessage();
			message.setFrom(FROM_EMAIL);
			message.setTo(offer.getBuyer().getEmail());
			message.setSubject("Response to Your Offer: " + offer.getPainting().getTitle());
			message.setText(String.format(
					"Hello %s,\n\nThe artist has responded to your offer for '%s'.\n\n" +
					"Status: %s\n" +
					"Message: %s\n\n" +
					"Please log in to see the full details.\n\nBest regards,\nArtkezai Team",
					offer.getBuyer().getFirstName(),
					offer.getPainting().getTitle(),
					offer.getStatus().name(),
					offer.getAdminMessage() != null ? offer.getAdminMessage() : "No message"
			));

			mailSender.send(message);
			log.info("Offer response email sent to: {}", offer.getBuyer().getEmail());
		} catch (Exception ex) {
			log.error("Failed to send offer response email", ex);
		}
	}

	public void sendOrderCreated(Order order) {
		try {
			SimpleMailMessage message = new SimpleMailMessage();
			message.setFrom(FROM_EMAIL);
			message.setTo(order.getBuyer().getEmail());
			message.setSubject("Order Created: " + order.getPainting().getTitle());
			message.setText(String.format(
					"Hello %s,\n\nYour order has been created successfully!\n\n" +
					"Painting: %s\n" +
					"Total Price: %s %s\n" +
					"Shipping To: %s, %s\n\n" +
					"Please proceed with payment to complete your order.\n\nBest regards,\nArtkezai Team",
					order.getBuyer().getFirstName(),
					order.getPainting().getTitle(),
					order.getTotalPrice(),
					order.getCurrency(),
					order.getShippingCity(),
					order.getShippingCountry()
			));

			mailSender.send(message);
			log.info("Order created email sent to: {}", order.getBuyer().getEmail());
		} catch (Exception ex) {
			log.error("Failed to send order created email", ex);
		}
	}

	public void sendShippingUpdate(Order order) {
		try {
			SimpleMailMessage message = new SimpleMailMessage();
			message.setFrom(FROM_EMAIL);
			message.setTo(order.getBuyer().getEmail());
			message.setSubject("Shipping Update: " + order.getPainting().getTitle());
			message.setText(String.format(
					"Hello %s,\n\nYour order has been updated!\n\n" +
					"Painting: %s\n" +
					"Status: %s\n" +
					"Tracking Number: %s\n" +
					"Tracking URL: %s\n\n" +
					"Best regards,\nArtkezai Team",
					order.getBuyer().getFirstName(),
					order.getPainting().getTitle(),
					order.getStatus().name(),
					order.getTrackingNumber() != null ? order.getTrackingNumber() : "Not available yet",
					order.getTrackingUrl() != null ? order.getTrackingUrl() : "Not available yet"
			));

			mailSender.send(message);
			log.info("Shipping update email sent to: {}", order.getBuyer().getEmail());
		} catch (Exception ex) {
			log.error("Failed to send shipping update email", ex);
		}
	}

	public void sendPasswordReset(User user, String resetLink) {
		try {
			SimpleMailMessage message = new SimpleMailMessage();
			message.setFrom(FROM_EMAIL);
			message.setTo(user.getEmail());
			message.setSubject("Password Reset Request");
			message.setText(String.format(
					"Hello %s,\n\nYou requested a password reset. Please click the link below to reset your password:\n\n" +
					"%s\n\n" +
					"This link will expire in 24 hours.\n\n" +
					"If you did not request this, please ignore this email.\n\nBest regards,\nArtkezai Team",
					user.getFirstName(),
					resetLink
			));

			mailSender.send(message);
			log.info("Password reset email sent to: {}", user.getEmail());
		} catch (Exception ex) {
			log.error("Failed to send password reset email", ex);
		}
	}

}
