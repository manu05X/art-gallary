package com.artkezai.order;

import com.artkezai.common.response.ApiResponse;
import com.artkezai.order.dto.CreateOrderRequest;
import com.artkezai.order.dto.OrderDto;
import com.artkezai.order.dto.UpdateShippingRequest;
import com.artkezai.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

	private final OrderService orderService;

	@PostMapping
	@PreAuthorize("hasRole('BUYER')")
	public ResponseEntity<ApiResponse<OrderDto>> createOrder(
			@Valid @RequestBody CreateOrderRequest request,
			Authentication authentication) {
		User buyer = (User) authentication.getPrincipal();
		log.info("Create order request from: {}", buyer.getEmail());
		OrderDto order = orderService.createOrder(request, buyer);
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(order, "Order created"));
	}

	@GetMapping("/my")
	@PreAuthorize("hasRole('BUYER')")
	public ResponseEntity<ApiResponse<Page<OrderDto>>> getBuyerOrders(
			@PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
			Authentication authentication) {
		User buyer = (User) authentication.getPrincipal();
		log.info("Get my orders request from: {}", buyer.getEmail());
		Page<OrderDto> orders = orderService.getBuyerOrders(buyer, pageable);
		return ResponseEntity.ok(ApiResponse.ok(orders));
	}

	@GetMapping
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<ApiResponse<Page<OrderDto>>> getAllOrders(
			@PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
		log.info("Get all orders request");
		Page<OrderDto> orders = orderService.getAllOrders(pageable);
		return ResponseEntity.ok(ApiResponse.ok(orders));
	}

	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<OrderDto>> getOrder(@PathVariable Long id) {
		log.info("Get order: {}", id);
		OrderDto order = orderService.getOrder(id);
		return ResponseEntity.ok(ApiResponse.ok(order));
	}

	@PatchMapping("/{id}/shipping")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<ApiResponse<OrderDto>> updateShipping(
			@PathVariable Long id,
			@Valid @RequestBody UpdateShippingRequest request) {
		log.info("Update shipping for order: {}", id);
		OrderDto order = orderService.updateShipping(id, request);
		return ResponseEntity.ok(ApiResponse.ok(order, "Shipping updated"));
	}

}
