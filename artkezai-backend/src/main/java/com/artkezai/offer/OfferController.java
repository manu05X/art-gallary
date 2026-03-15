package com.artkezai.offer;

import com.artkezai.common.response.ApiResponse;
import com.artkezai.offer.dto.MakeOfferRequest;
import com.artkezai.offer.dto.OfferDto;
import com.artkezai.offer.dto.RespondOfferRequest;
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
@RequestMapping("/api/offers")
@RequiredArgsConstructor
@Slf4j
public class OfferController {

	private final OfferService offerService;

	@PostMapping
	@PreAuthorize("hasRole('BUYER')")
	public ResponseEntity<ApiResponse<OfferDto>> makeOffer(
			@Valid @RequestBody MakeOfferRequest request,
			Authentication authentication) {
		User buyer = (User) authentication.getPrincipal();
		log.info("Make offer request from: {}", buyer.getEmail());
		OfferDto offer = offerService.makeOffer(request, buyer);
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(offer, "Offer submitted"));
	}

	@GetMapping("/my")
	@PreAuthorize("hasRole('BUYER')")
	public ResponseEntity<ApiResponse<Page<OfferDto>>> getBuyerOffers(
			@PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
			Authentication authentication) {
		User buyer = (User) authentication.getPrincipal();
		log.info("Get my offers request from: {}", buyer.getEmail());
		Page<OfferDto> offers = offerService.getBuyerOffers(buyer, pageable);
		return ResponseEntity.ok(ApiResponse.ok(offers));
	}

	@GetMapping("/received")
	@PreAuthorize("hasRole('ARTIST')")
	public ResponseEntity<ApiResponse<Page<OfferDto>>> getArtistOffers(
			@PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
			Authentication authentication) {
		User artist = (User) authentication.getPrincipal();
		log.info("Get received offers request from: {}", artist.getEmail());
		Page<OfferDto> offers = offerService.getArtistOffers(artist, pageable);
		return ResponseEntity.ok(ApiResponse.ok(offers));
	}

	@GetMapping
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<ApiResponse<Page<OfferDto>>> getAllOffers(
			@PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
		log.info("Get all offers request");
		Page<OfferDto> offers = offerService.getAllOffers(pageable);
		return ResponseEntity.ok(ApiResponse.ok(offers));
	}

	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<OfferDto>> getOffer(@PathVariable Long id) {
		log.info("Get offer: {}", id);
		OfferDto offer = offerService.getOffer(id);
		return ResponseEntity.ok(ApiResponse.ok(offer));
	}

	@PostMapping("/{id}/respond")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<ApiResponse<OfferDto>> respondToOffer(
			@PathVariable Long id,
			@Valid @RequestBody RespondOfferRequest request) {
		log.info("Respond to offer: {}", id);
		OfferDto offer = offerService.respondToOffer(id, request);
		return ResponseEntity.ok(ApiResponse.ok(offer, "Offer responded"));
	}

	@PostMapping("/{id}/withdraw")
	public ResponseEntity<ApiResponse<OfferDto>> withdrawOffer(
			@PathVariable Long id,
			Authentication authentication) {
		User buyer = (User) authentication.getPrincipal();
		log.info("Withdraw offer: {} by: {}", id, buyer.getEmail());
		OfferDto offer = offerService.withdrawOffer(id, buyer);
		return ResponseEntity.ok(ApiResponse.ok(offer, "Offer withdrawn"));
	}

}
