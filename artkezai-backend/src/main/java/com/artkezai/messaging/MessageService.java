package com.artkezai.messaging;

import com.artkezai.notification.NotificationService;
import com.artkezai.common.exception.BusinessException;
import com.artkezai.common.exception.ResourceNotFoundException;
import com.artkezai.common.exception.UnauthorizedException;
import com.artkezai.messaging.dto.MessageDto;
import com.artkezai.messaging.dto.SendMessageRequest;
import com.artkezai.messaging.dto.ThreadDto;
import com.artkezai.painting.Painting;
import com.artkezai.painting.PaintingRepository;
import com.artkezai.user.User;
import com.artkezai.user.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MessageService {

	private final ThreadRepository threadRepository;
	private final MessageRepository messageRepository;
	private final PaintingRepository paintingRepository;
	private final NotificationService notificationService;

	public ThreadDto createThread(SendMessageRequest request, User user) {
		if (request.getSubject() == null || request.getSubject().trim().isEmpty()) {
			throw new BusinessException("Subject is required for new thread");
		}

		Painting painting = null;
		if (request.getPaintingId() != null) {
			painting = paintingRepository.findById(request.getPaintingId())
					.orElseThrow(() -> new ResourceNotFoundException("Painting", "id", request.getPaintingId()));
		}

		MessageThread thread = MessageThread.builder()
				.subject(request.getSubject())
				.user(user)
				.painting(painting)
				.isResolved(false)
				.build();

		thread = threadRepository.save(thread);

		Message message = Message.builder()
				.body(request.getBody())
				.thread(thread)
				.sender(user)
				.isRead(false)
				.build();

		messageRepository.save(message);
		notificationService.notifyAdmins("NEW_MESSAGE", "New message: " + thread.getSubject(), "/admin/messages");
		log.info("Message thread created: {} by user: {}", thread.getId(), user.getEmail());
		return toThreadDto(thread, 0L);
	}

	@Transactional(readOnly = true)
	public Page<ThreadDto> listMyThreads(User user, Pageable pageable) {
		// Admins are the gallery side of every conversation, so their inbox is
		// every thread; members see only the threads they started.
		Page<MessageThread> threads = isAdmin(user)
				? threadRepository.findAllByOrderByLastMessageAtDesc(pageable)
				: threadRepository.findByUserIdOrderByLastMessageAtDesc(user.getId(), pageable);
		return threads.map(thread -> toThreadDto(thread, unreadFor(thread, user)));
	}

	@Transactional(readOnly = true)
	public ThreadDto getThread(Long threadId, User user) {
		MessageThread thread = threadRepository.findById(threadId)
				.orElseThrow(() -> new ResourceNotFoundException("MessageThread", "id", threadId));

		checkAccess(thread, user);

		ThreadDto dto = toThreadDto(thread, unreadFor(thread, user));
		dto.setMessages(thread.getMessages().stream()
				.sorted(Comparator.comparing(Message::getCreatedAt))
				.map(this::toMessageDto)
				.toList());
		return dto;
	}

	public MessageDto sendMessage(Long threadId, SendMessageRequest request, User user) {
		MessageThread thread = threadRepository.findById(threadId)
				.orElseThrow(() -> new ResourceNotFoundException("MessageThread", "id", threadId));

		checkAccess(thread, user);

		// The first admin to reply takes ownership of the conversation.
		if (isAdmin(user) && thread.getAdmin() == null) {
			thread.setAdmin(user);
		}

		Message message = Message.builder()
				.body(request.getBody())
				.thread(thread)
				.sender(user)
				.isRead(false)
				.build();

		message = messageRepository.save(message);
		thread.setLastMessageAt(LocalDateTime.now());
		threadRepository.save(thread);
		if (isAdmin(user)) {
			notificationService.notifyUser(thread.getUser(), "NEW_MESSAGE",
					"The gallery replied: " + thread.getSubject(), messagesPathFor(thread.getUser()));
		} else {
			notificationService.notifyAdmins("NEW_MESSAGE", "New reply: " + thread.getSubject(), "/admin/messages");
		}
		log.info("Message sent in thread: {} by user: {}", threadId, user.getEmail());
		return toMessageDto(message);
	}

	public void markAsRead(Long threadId, User user) {
		MessageThread thread = threadRepository.findById(threadId)
				.orElseThrow(() -> new ResourceNotFoundException("MessageThread", "id", threadId));

		checkAccess(thread, user);

		List<Message> unreadMessages = thread.getMessages().stream()
				.filter(m -> !m.getIsRead())
				.filter(m -> !m.getSender().getId().equals(user.getId()))
				.toList();

		for (Message message : unreadMessages) {
			message.setIsRead(true);
			message.setReadAt(LocalDateTime.now());
			messageRepository.save(message);
		}

		log.info("Marked thread {} as read by user: {}", threadId, user.getEmail());
	}

	// Thread starter or any admin. Admins answer on behalf of the gallery, so
	// access is not limited to the admin currently assigned to the thread.
	private void checkAccess(MessageThread thread, User user) {
		if (!thread.getUser().getId().equals(user.getId()) && !isAdmin(user)) {
			throw new UnauthorizedException("You don't have access to this thread");
		}
	}

	private static String messagesPathFor(User member) {
		return member.getRole() == UserRole.ARTIST ? "/artist/messages" : "/dashboard/messages";
	}

	private boolean isAdmin(User user) {
		return user.getRole() == UserRole.ADMIN;
	}

	// Messages the viewer has not read yet; their own messages never count.
	private long unreadFor(MessageThread thread, User viewer) {
		return thread.getMessages().stream()
				.filter(m -> !m.getIsRead())
				.filter(m -> !m.getSender().getId().equals(viewer.getId()))
				.count();
	}

	private ThreadDto toThreadDto(MessageThread thread, Long unreadCount) {
		return ThreadDto.builder()
				.id(thread.getId())
				.subject(thread.getSubject())
				.userId(thread.getUser().getId())
				.userName(thread.getUser().getFirstName() + " " + thread.getUser().getLastName())
				.isResolved(thread.getIsResolved())
				.lastMessageAt(thread.getLastMessageAt())
				.unreadCount(unreadCount)
				.paintingId(thread.getPainting() != null ? thread.getPainting().getId() : null)
				.createdAt(thread.getCreatedAt())
				.build();
	}

	private MessageDto toMessageDto(Message message) {
		return MessageDto.builder()
				.id(message.getId())
				.threadId(message.getThread().getId())
				.senderId(message.getSender().getId())
				.senderName(message.getSender().getFirstName() + " " + message.getSender().getLastName())
				.body(message.getBody())
				.isRead(message.getIsRead())
				.createdAt(message.getCreatedAt())
				.build();
	}

}
