package com.artkezai.painting;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "mediums")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medium {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String name;

	@Column(nullable = false, unique = true)
	private String slug;

	@Builder.Default
	@Column(nullable = false)
	private Boolean isActive = true;

}
