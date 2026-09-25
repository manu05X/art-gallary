package com.artkezai.messaging;

import com.artkezai.notification.NotificationService;
import com.artkezai.common.exception.UnauthorizedException;
import com.artkezai.messaging.dto.SendMessageRequest;
import com.artkezai.messaging.dto.ThreadDto;
import com.artkezai.painting.PaintingRepository;
import com.artkezai.user.User;
import com.artkezai.user.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static com.artkezai.TestData.user;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MessageServiceTest {

	@Mock
	private ThreadRepository threadRepository;
	@Mock
	private MessageRepository messageRepository;
	@Mock
	private PaintingRepository paintingRepository;

	@Mock
	private NotificationService notificationService;

	@InjectMocks
	private MessageService messageService;

	private final User buyer = user(1, UserRole.BUYER);
	private final User admin = user(9, UserRole.ADMIN);
	private MessageThread thread;

	@BeforeEach
	void setUp() {
		thread = MessageThread.builder().id(5L).subject("Shipping?").user(buyer).isResolved(false)
				.messages(new ArrayList<>()).build();
		thread.getMessages().add(message(1, buyer, LocalDateTime.now().minusMinutes(5)));
		thread.getMessages().add(message(2, admin, LocalDateTime.now()));
	}

	private Message message(long id, User sender, LocalDateTime at) {
		return Message.builder().id(id).thread(thread).sender(sender).body("m" + id).isRead(false).createdAt(at).build();
	}

	@Test
	void threadDetailReturnsHistoryInOrder() {
		when(threadRepository.findById(5L)).thenReturn(Optional.of(thread));

		ThreadDto dto = messageService.getThread(5L, buyer);

		assertThat(dto.getMessages()).extracting("body").containsExactly("m1", "m2");
		assertThat(dto.getUnreadCount()).isEqualTo(1L);
	}

	@Test
	void anyAdminCanReplyAndBecomesTheThreadAdmin() {
		when(threadRepository.findById(5L)).thenReturn(Optional.of(thread));
		when(messageRepository.save(any(Message.class))).thenAnswer(inv -> inv.getArgument(0));

		messageService.sendMessage(5L, new SendMessageRequest("Yes", null, null), admin);

		assertThat(thread.getAdmin()).isEqualTo(admin);
	}

	@Test
	void otherMembersCannotReadTheThread() {
		when(threadRepository.findById(5L)).thenReturn(Optional.of(thread));

		assertThatThrownBy(() -> messageService.getThread(5L, user(3, UserRole.BUYER)))
				.isInstanceOf(UnauthorizedException.class);
	}

	@Test
	void adminInboxListsEveryThread() {
		Pageable page = PageRequest.of(0, 20);
		when(threadRepository.findAllByOrderByLastMessageAtDesc(page)).thenReturn(new PageImpl<>(List.of(thread), page, 1));

		assertThat(messageService.listMyThreads(admin, page).getContent()).hasSize(1);
		verify(threadRepository, never()).findByUserIdOrderByLastMessageAtDesc(any(), any());
	}
}
