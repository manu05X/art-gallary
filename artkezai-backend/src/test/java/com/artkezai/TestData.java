package com.artkezai;

import com.artkezai.artist.ArtistProfile;
import com.artkezai.offer.Offer;
import com.artkezai.offer.OfferStatus;
import com.artkezai.order.Order;
import com.artkezai.order.OrderStatus;
import com.artkezai.painting.Painting;
import com.artkezai.painting.PaintingStatus;
import com.artkezai.payment.Payment;
import com.artkezai.payment.PaymentMethod;
import com.artkezai.payment.PaymentStatus;
import com.artkezai.user.User;
import com.artkezai.user.UserRole;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Small builders for service unit tests. Only the fields the services read
// are populated.
public final class TestData {

	private TestData() {
	}

	public static User user(long id, UserRole role) {
		return User.builder()
				.id(id)
				.email("user" + id + "@example.test")
				.firstName("First" + id)
				.lastName("Last" + id)
				.passwordHash("hash")
				.role(role)
				.build();
	}

	public static Painting painting(long id, PaintingStatus status, User artistUser) {
		ArtistProfile artist = ArtistProfile.builder()
				.id(100 + artistUser.getId())
				.displayName("Artist " + artistUser.getId())
				.slug("artist-" + artistUser.getId())
				.user(artistUser)
				.build();
		return Painting.builder()
				.id(id)
				.title("Painting " + id)
				.slug("painting-" + id)
				.price(new BigDecimal("1000.00"))
				.currency("USD")
				.status(status)
				.artist(artist)
				.build();
	}

	public static Offer offer(long id, Painting painting, User buyer, OfferStatus status) {
		return Offer.builder()
				.id(id)
				.painting(painting)
				.buyer(buyer)
				.offerAmount(new BigDecimal("800.00"))
				.currency("USD")
				.status(status)
				.expiresAt(LocalDateTime.now().plusDays(3))
				.build();
	}

	public static Order order(long id, Painting painting, User buyer, OrderStatus status) {
		return Order.builder()
				.id(id)
				.painting(painting)
				.buyer(buyer)
				.totalPrice(painting.getPrice())
				.currency("USD")
				.status(status)
				.build();
	}

	public static Payment payment(long id, Order order, PaymentMethod method, PaymentStatus status) {
		return Payment.builder()
				.id(id)
				.order(order)
				.paymentMethod(method)
				.status(status)
				.amount(order.getTotalPrice())
				.currency("USD")
				.build();
	}
}
