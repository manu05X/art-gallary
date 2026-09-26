# Spec Delta

## Purpose

Defines how painting images and artist profile photos are accepted, stored in object storage and addressed by public URL, including how uploads behave when storage is missing or unavailable, in every environment.

## ADDED Requirements

### Requirement: Uploaded images are stored and publicly retrievable

When an artist uploads a painting image or profile photo, the system SHALL store the file in the configured object storage bucket and SHALL return a URL under the configured public base URL. A plain HTTP GET on that URL, with no authentication, SHALL return the stored image. The upload endpoints and their response bodies SHALL remain as they are today.

#### Scenario: Painting image upload in production
- **WHEN** an artist uploads a valid JPEG to one of their own draft paintings in an environment configured with object storage
- **THEN** the response is HTTP 201 with an image `url` that starts with the configured public base URL
- **AND** an unauthenticated GET on that URL returns HTTP 200 with the uploaded bytes and an image content type

#### Scenario: Artist profile photo upload
- **WHEN** an artist uploads a valid PNG as their profile photo
- **THEN** the returned photo URL starts with the configured public base URL and is retrievable without authentication

#### Scenario: Local development keeps working
- **WHEN** the backend runs with the local Docker MinIO defaults
- **THEN** uploads succeed and return URLs under `http://localhost:9000/<bucket>/` exactly as before

### Requirement: Only images are accepted

The system SHALL accept only JPEG, PNG and WebP images for painting images and profile photos. A file is accepted only when both its declared content type and its leading bytes (file signature) match one of these formats. Any other file SHALL be rejected with HTTP 400 and SHALL NOT be written to storage. The existing 10 MB per-file limit SHALL still apply, and exceeding it SHALL return HTTP 413.

#### Scenario: HTML disguised as an image is rejected
- **WHEN** an upload declares `image/png` but its content starts with `<html`
- **THEN** the response is HTTP 400 with a message that only JPEG, PNG or WebP images are accepted
- **AND** no object is written to storage and no image row is created

#### Scenario: SVG is rejected
- **WHEN** an artist uploads an `image/svg+xml` file
- **THEN** the response is HTTP 400 and nothing is stored

#### Scenario: WebP is accepted
- **WHEN** an artist uploads a valid WebP image
- **THEN** the upload succeeds with HTTP 201

#### Scenario: File larger than the limit
- **WHEN** an artist uploads an image larger than 10 MB
- **THEN** the response is HTTP 413 with a message stating the size limit, not a generic HTTP 500

### Requirement: Image URLs are always valid

The public URL of every stored image SHALL be a valid URL that needs no further encoding, whatever the original filename. The storage key SHALL contain only lowercase ASCII letters, digits, `-`, `_`, `.` and `/`, SHALL include a random unique component, and SHALL end with an extension matching the detected image format. The original filename SHALL NOT affect where the object is stored beyond this sanitized form.

#### Scenario: Filename with spaces and non-ASCII characters
- **WHEN** an artist uploads `Mona Lisa (copy) é.JPG`
- **THEN** the returned URL contains no spaces, parentheses or non-ASCII characters, ends in `.jpg`, and returns the image when requested

#### Scenario: Filename with path characters
- **WHEN** an upload's original filename is `../../etc/passwd.png` and its content is a valid PNG
- **THEN** the object is stored under the painting's own key prefix, and the key contains no `..` segment

### Requirement: Clear behavior when storage is unavailable

When object storage is not configured, or does not accept a write, uploads SHALL fail with HTTP 503 and a message saying image storage is temporarily unavailable. They SHALL NOT fail with a generic HTTP 500, and SHALL NOT create an image row. Storage problems SHALL NOT affect the service health endpoint or any endpoint that doesn't upload images.

#### Scenario: Storage not configured
- **WHEN** the backend runs without a storage endpoint and an artist uploads an image
- **THEN** the response is HTTP 503 with a readable "image storage is unavailable" message
- **AND** `GET /actuator/health` still reports UP

#### Scenario: Storage rejects the write
- **WHEN** the storage service rejects a write (for example, invalid credentials)
- **THEN** the response is HTTP 503, no image row is created, and the error is logged with the storage error code

#### Scenario: Production startup without storage
- **WHEN** the backend starts with the production profile and no storage endpoint, or a localhost one
- **THEN** it starts normally and logs a warning that names the missing storage settings

### Requirement: Uploaded images render in the web app

The web app SHALL display images served from the configured production image host, as well as the existing local and seed image hosts.

#### Scenario: Uploaded image shown in the gallery
- **WHEN** an approved painting's primary image URL is on the production image host
- **THEN** the gallery card and the painting detail page display the image without an image-optimizer error
