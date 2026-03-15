package com.artkezai.messaging;

import com.artkezai.common.exception.BusinessException;
import com.artkezai.common.exception.ResourceNotFoundException;
import com.artkezai.messaging.dto.MessageDto;
import com.artkezai.messaging.dto.SendMessageRequest;
import com.artkezai.messaging.dto.ThreadDto;
import com.artkezai.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MessageService {

	private final ThreadRepository threadRepository;
	private final MessageRepository messageRepository;

	public ThreadDto createThread(SendMessageRequest request, User user) {
		if (request.getSubject() == null || request.getSubject().trim().isEmpty()) {
			throw new BusinessException("Subject is required for new thread");
		}

		MessageThread thread = MessageThread.builder()
				.subject(request.getSubject())
				.user(user)
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
		log.info("Message thread created: {} by user: {}", thread.getId(), user.getEmail());
		return toThreadDto(thread, 0L);
	}

	@Transactional(readOnly = true)
	public Page<ThreadDto> listMyThreads(User user, Pageable pageable) {
		return threadRepository.findByUserIdOrderByLastMessageAtDesc(user.getId(), pageable)
				.map(thread -> {
					long unreadCount = thread.getMessages().stream()
							.filter(m -> !m.getIsRead())
							.count();
					return toThreadDto(thread, unreadCount);
				});
	}

	@Transactional(readOnly = true)
	public ThreadDto getThread(Long threadId, User user) {
		MessageThread thread = threadRepository.findById(threadId)
				.orElseThrow(() -> new ResourceNotFoundException("MessageThread", "id", threadId));

		if (!thread.getUser().getId().equals(user.getId()) &&
		    (thread.getAdmin() == null || !thread.getAdmin().getId().equals(user.getId()))) {
			throw new BusinessException("You don't have access to this thread");
		}

		long unreadCount = thread.getMessages().stream()
				.filter(m -> !m.getIsRead())
				.count();

		return toThreadDto(thread, unreadCount);
	}

	public MessageDto sendMessage(Long threadId, SendMessageRequest request, User user) {
		MessageThread thread = threadRepository.findById(threadId)
				.orElseThrow(() -> new ResourceNotFoundException("MessageThread", "id", threadId));

		if (!thread.getUser().getId().equals(user.getId()) &&
		    (thread.getAdmin() == null || !thread.getAdmin().getId().equals(user.getId()))) {
			throw new BusinessException("You don't have access to this thread");
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
		log.info("Message sent in thread: {} by user: {}", threadId, user.getEmail());
		return toMessageDto(message);
	}

	public void markAsRead(Long threadId, User user) {
		MessageThread thread = threadRepository.findById(threadId)
				.orElseThrow(() -> new ResourceNotFoundException("MessageThread", "id", threadId));

		if (!thread.getUser().getId().equals(user.getId()) &&
		    (thread.getAdmin() == null || !thread.getAdmin().getId().equals(user.getId()))) {
			throw new BusinessException("You don't have access to this thread");
		}

		List<Message> unreadMessages = thread.getMessages().stream()
				.filter(m -> !m.getIsRead())
				.toList();

		for (Message message : unreadMessages) {
			message.setIsRead(true);
			message.setReadAt(LocalDateTime.now());
			messageRepository.save(message);
		}

		log.info("Marked thread {} as read by user: {}", threadId, user.getEmail());
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
