package com.artkezai.notification;

import com.artkezai.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

	@Mock
	private JavaMailSender mailSender;

	@InjectMocks
	private EmailService emailService;

	private User user;

	@BeforeEach
	void setUp() {
		ReflectionTestUtils.setField(emailService, "mailFrom", "sender@example.test");
		ReflectionTestUtils.setField(emailService, "mailFromName", "Artkezai Gallery");
		user = new User();
		user.setEmail("buyer@example.test");
		user.setFirstName("Ana");
	}

	@Test
	void sendsFromConfiguredSender() {
		emailService.sendPasswordReset(user, "https://example.test/reset?token=t");

		ArgumentCaptor<SimpleMailMessage> sent = ArgumentCaptor.forClass(SimpleMailMessage.class);
		verify(mailSender).send(sent.capture());
		assertThat(sent.getValue().getFrom()).isEqualTo("Artkezai Gallery <sender@example.test>");
		assertThat(sent.getValue().getTo()).containsExactly("buyer@example.test");
	}

	@Test
	void smtpFailureDoesNotPropagate() {
		doThrow(new MailSendException("unreachable")).when(mailSender).send(any(SimpleMailMessage.class));

		assertThatCode(() -> emailService.sendPasswordReset(user, "https://example.test/reset?token=t"))
				.doesNotThrowAnyException();
	}

}
