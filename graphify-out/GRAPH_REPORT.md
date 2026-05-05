# Graph Report - server  (2026-04-20)

## Corpus Check
- Corpus is ~12,275 words - fits in a single context window. You may not need a graph.

## Summary
- 109 nodes · 129 edges · 29 communities detected
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]

## God Nodes (most connected - your core abstractions)
1. `GmailWebhookService` - 8 edges
2. `BookingController` - 6 edges
3. `EmailProcessor` - 6 edges
4. `OutboxService` - 4 edges
5. `TemplateEngine` - 4 edges
6. `GmailWatchService` - 4 edges
7. `WebhookController` - 3 edges
8. `buildMimeMessage()` - 3 edges
9. `GmailSenderService` - 3 edges
10. `parsePubsubData()` - 3 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (6): parseIntParam(), extractEmail(), getHeader(), GmailWebhookService, parsePubsubData(), shortRequestId()

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (4): decodeGmailBase64(), EmailProcessor, extractEmailAddress(), WebhookController

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (5): getBackoffMinutes(), normalizeError(), OutboxService, shouldRetry(), processOutboxBatch()

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (3): BookingController, getEventName(), toDate()

### Community 4 - "Community 4"
Cohesion: 0.0
Nodes (2): GmailWatchService, renewWatch()

### Community 5 - "Community 5"
Cohesion: 0.0
Nodes (2): getHandlebars(), TemplateEngine

### Community 6 - "Community 6"
Cohesion: 0.0
Nodes (4): buildMimeMessage(), GmailSenderService, sanitizeHeaderValue(), toBase64Url()

### Community 7 - "Community 7"
Cohesion: 0.0
Nodes (2): ensureSettings(), toProfileFromUser()

### Community 8 - "Community 8"
Cohesion: 0.0
Nodes (2): ensureDefaultAdmin(), startServer()

### Community 9 - "Community 9"
Cohesion: 0.0
Nodes (2): checkRequiredEnv(), init()

### Community 10 - "Community 10"
Cohesion: 0.0
Nodes (2): createBookingRequestSchema(), getBookingRequestModel()

### Community 11 - "Community 11"
Cohesion: 0.0
Nodes (2): createEmailLogSchema(), getEmailLogModel()

### Community 12 - "Community 12"
Cohesion: 0.0
Nodes (2): createOutboxSchema(), getOutboxModel()

### Community 13 - "Community 13"
Cohesion: 0.0
Nodes (2): getBucket(), uploadImageFromRequest()

### Community 14 - "Community 14"
Cohesion: 0.0
Nodes (2): buildMockPubsubPayload(), testWebhook()

### Community 15 - "Community 15"
Cohesion: 0.0
Nodes (0): 

### Community 16 - "Community 16"
Cohesion: 0.0
Nodes (0): 

### Community 17 - "Community 17"
Cohesion: 0.0
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 0.0
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 0.0
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 0.0
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 0.0
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 0.0
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 0.0
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 0.0
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 0.0
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 0.0
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 0.0
Nodes (0): 

### Community 28 - "Community 28"
Cohesion: 0.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 15`** (2 nodes): `authMiddleware()`, `auth.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (2 nodes): `users.js`, `toSafeUser()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (2 nodes): `seed()`, `seedSettings.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (1 nodes): `pubsub.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (1 nodes): `Notification.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (1 nodes): `SecurityActivity.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (1 nodes): `Setting.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (1 nodes): `User.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `Venue.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `bookingRoutes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `notifications.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `securityActivity.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `venues.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `webhookRoutes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.