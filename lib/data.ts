// Data management for bookings, messages, and reviews using localStorage

export interface Booking {
  id: string
  customerId: string
  customerName: string
  vendorId: string
  vendorName: string
  vendorBusinessName: string
  service: string
  eventDate: string
  eventType: string
  guestCount?: number
  budget?: string
  specialRequests?: string
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'
  vendorResponseNote?: string // Vendor's response when accepting/rejecting
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  userId: string
  type: 'booking_request' | 'booking_accepted' | 'booking_rejected' | 'booking_completed' | 'review_prompt' | 'dispute_update' | 'message' | 'vendor_approved' | 'vendor_rejected'
  title: string
  message: string
  relatedBookingId?: string
  relatedDisputeId?: string
  read: boolean
  createdAt: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  receiverId: string
  content: string
  timestamp: string
  read: boolean
}

export interface Conversation {
  id: string
  customerId: string
  customerName: string
  vendorId: string
  vendorName: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

export interface Review {
  id: string
  bookingId: string
  customerId: string
  customerName: string
  vendorId: string
  rating: number
  comment: string
  createdAt: string
}

export interface Dispute {
  id: string
  bookingId: string
  customerId: string
  customerName: string
  vendorId: string
  vendorName: string
  title: string
  description: string
  category: 'quality' | 'behavior' | 'payment' | 'schedule' | 'damage' | 'other'
  evidence?: string[]
  status: 'open' | 'in-review' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  updatedAt: string
  resolution?: string
}

// LocalStorage keys
const BOOKINGS_KEY = 'eventora_bookings'
const MESSAGES_KEY = 'eventora_messages'
const CONVERSATIONS_KEY = 'eventora_conversations'
const REVIEWS_KEY = 'eventora_reviews'
const DISPUTES_KEY = 'eventora_disputes'
const NOTIFICATIONS_KEY = 'eventora_notifications'

// Booking Management
export function getBookings(): Booking[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(BOOKINGS_KEY)
  return stored ? JSON.parse(stored) : []
}

export function saveBookings(bookings: Booking[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings))
}

export function getUserBookings(userId: string, role: 'customer' | 'vendor'): Booking[] {
  const bookings = getBookings()
  return bookings.filter(b => 
    role === 'customer' ? b.customerId === userId : b.vendorId === userId
  )
}

export function createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Booking {
  const bookings = getBookings()
  const newBooking: Booking = {
    ...bookingData,
    id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  bookings.push(newBooking)
  saveBookings(bookings)
  return newBooking
}

export function updateBookingStatus(
  bookingId: string,
  status: Booking['status'],
  vendorResponseNote?: string
): boolean {
  const bookings = getBookings()
  const index = bookings.findIndex(b => b.id === bookingId)
  if (index === -1) return false
  
  bookings[index].status = status
  if (vendorResponseNote && vendorResponseNote.trim()) {
    bookings[index].vendorResponseNote = vendorResponseNote.trim()
  }
  bookings[index].updatedAt = new Date().toISOString()
  saveBookings(bookings)
  return true
}

export function getBookingById(bookingId: string): Booking | undefined {
  return getBookings().find(b => b.id === bookingId)
}

// Message Management
export function getMessages(): Message[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(MESSAGES_KEY)
  return stored ? JSON.parse(stored) : []
}

export function saveMessages(messages: Message[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages))
}

export function getConversationMessages(conversationId: string): Message[] {
  return getMessages().filter(m => m.conversationId === conversationId)
}

export function sendMessage(messageData: Omit<Message, 'id' | 'timestamp' | 'read'>): Message {
  const messages = getMessages()
  const newMessage: Message = {
    ...messageData,
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    read: false,
  }
  messages.push(newMessage)
  saveMessages(messages)
  
  // Update conversation
  updateConversation(messageData.conversationId, newMessage.content, messageData.receiverId)
  
  return newMessage
}

export function markMessageAsRead(messageId: string): void {
  const messages = getMessages()
  const message = messages.find(m => m.id === messageId)
  if (message) {
    message.read = true
    saveMessages(messages)
  }
}

export function markConversationAsRead(conversationId: string, userId: string): void {
  const messages = getMessages()
  messages.forEach(m => {
    if (m.conversationId === conversationId && m.receiverId === userId) {
      m.read = true
    }
  })
  saveMessages(messages)
  
  // Update conversation unread count
  const conversations = getConversations()
  const conv = conversations.find(c => c.id === conversationId)
  if (conv) {
    conv.unreadCount = 0
    saveConversations(conversations)
  }
}

// Conversation Management
export function getConversations(): Conversation[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(CONVERSATIONS_KEY)
  return stored ? JSON.parse(stored) : []
}

export function saveConversations(conversations: Conversation[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations))
}

export function getUserConversations(userId: string, role: 'customer' | 'vendor'): Conversation[] {
  const conversations = getConversations()
  return conversations.filter(c => 
    role === 'customer' ? c.customerId === userId : c.vendorId === userId
  )
}

export function getOrCreateConversation(customerId: string, customerName: string, vendorId: string, vendorName: string): string {
  const conversations = getConversations()
  
  // Check if conversation already exists
  const existing = conversations.find(c => 
    c.customerId === customerId && c.vendorId === vendorId
  )
  
  if (existing) return existing.id
  
  // Create new conversation
  const newConversation: Conversation = {
    id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    customerId,
    customerName,
    vendorId,
    vendorName,
    lastMessage: 'No messages yet',
    lastMessageTime: new Date().toISOString(),
    unreadCount: 0,
  }
  
  conversations.push(newConversation)
  saveConversations(conversations)
  return newConversation.id
}

function updateConversation(conversationId: string, lastMessage: string, receiverId: string): void {
  const conversations = getConversations()
  const conv = conversations.find(c => c.id === conversationId)
  if (conv) {
    conv.lastMessage = lastMessage.substring(0, 50) + (lastMessage.length > 50 ? '...' : '')
    conv.lastMessageTime = new Date().toISOString()
    conv.unreadCount += 1
    saveConversations(conversations)
  }
}

// Review Management
export function getReviews(): Review[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(REVIEWS_KEY)
  return stored ? JSON.parse(stored) : []
}

export function saveReviews(reviews: Review[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews))
}

export function getVendorReviews(vendorId: string): Review[] {
  return getReviews().filter(r => r.vendorId === vendorId)
}

export function canUserReview(customerId: string, vendorId: string): boolean {
  const bookings = getBookings()
  // User can review if they have a completed booking with this vendor
  return bookings.some(b => 
    b.customerId === customerId && 
    b.vendorId === vendorId && 
    b.status === 'completed'
  )
}

export function hasUserReviewedBooking(bookingId: string): boolean {
  return getReviews().some(r => r.bookingId === bookingId)
}

export function createReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Review {
  const reviews = getReviews()
  const newReview: Review = {
    ...reviewData,
    id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  }
  reviews.push(newReview)
  saveReviews(reviews)
  return newReview
}

export function getVendorAverageRating(vendorId: string): number {
  const reviews = getVendorReviews(vendorId)
  if (reviews.length === 0) return 0
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
  return sum / reviews.length
}

export function deleteReview(reviewId: string): { success: boolean; message: string } {
  const reviews = getReviews()
  const reviewIndex = reviews.findIndex(r => r.id === reviewId)
  
  if (reviewIndex === -1) {
    return { success: false, message: 'Review not found' }
  }
  
  reviews.splice(reviewIndex, 1)
  saveReviews(reviews)
  return { success: true, message: 'Review removed successfully' }
}

// Statistics
export function getBookingStats(userId: string, role: 'customer' | 'vendor') {
  const bookings = getUserBookings(userId, role)
  return {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    accepted: bookings.filter(b => b.status === 'accepted').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    rejected: bookings.filter(b => b.status === 'rejected').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  }
}
// Dispute Management
export function getDisputes(): Dispute[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(DISPUTES_KEY)
  return stored ? JSON.parse(stored) : []
}

export function saveDisputes(disputes: Dispute[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(DISPUTES_KEY, JSON.stringify(disputes))
}

export function getUserDisputes(userId: string, role: 'customer' | 'vendor'): Dispute[] {
  const disputes = getDisputes()
  return disputes.filter(d => 
    role === 'customer' ? d.customerId === userId : d.vendorId === userId
  )
}

export function canCreateDispute(customerId: string, bookingId: string): { can: boolean; message?: string } {
  // Get the booking
  const booking = getBookingById(bookingId)
  
  if (!booking) {
    return { can: false, message: 'Booking not found' }
  }

  // Verify booking belongs to the customer
  if (booking.customerId !== customerId) {
    return { can: false, message: 'You can only dispute your own bookings' }
  }

  // Verify booking status is eligible (completed or accepted)
  if (booking.status !== 'completed' && booking.status !== 'accepted') {
    return { can: false, message: `You can only dispute completed or accepted bookings, this booking is ${booking.status}` }
  }

  // Check if dispute already exists and is active
  const existingDispute = getDisputeByBookingId(bookingId)
  if (existingDispute && (existingDispute.status === 'open' || existingDispute.status === 'in-review')) {
    return { can: false, message: 'An active dispute already exists for this booking' }
  }

  return { can: true }
}

export function createDispute(disputeData: Omit<Dispute, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'resolution'>): { success: boolean; message: string; dispute?: Dispute } {
  // Validate that customer can create this dispute
  const validation = canCreateDispute(disputeData.customerId, disputeData.bookingId)
  if (!validation.can) {
    return { success: false, message: validation.message || 'Cannot create dispute' }
  }

  const disputes = getDisputes()
  const newDispute: Dispute = {
    ...disputeData,
    id: `dispute_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: 'open',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  disputes.push(newDispute)
  saveDisputes(disputes)
  createNotification({
    userId: newDispute.vendorId,
    type: 'dispute_update',
    title: 'New dispute raised',
    message: `A customer opened a dispute for booking ${newDispute.bookingId}.`,
    relatedBookingId: newDispute.bookingId,
    relatedDisputeId: newDispute.id,
    read: false,
  })
  return { success: true, message: 'Dispute created successfully', dispute: newDispute }
}

export function updateDisputeStatus(disputeId: string, status: Dispute['status'], resolution?: string): boolean {
  const disputes = getDisputes()
  const index = disputes.findIndex(d => d.id === disputeId)
  if (index === -1) return false
  
  disputes[index].status = status
  disputes[index].updatedAt = new Date().toISOString()
  if (resolution) {
    disputes[index].resolution = resolution
  }
  saveDisputes(disputes)
  return true
}

export function getDisputeByBookingId(bookingId: string): Dispute | undefined {
  return getDisputes().find(d => d.bookingId === bookingId)
}

export function hasDisputeForBooking(bookingId: string): boolean {
  return getDisputes().some(d => d.bookingId === bookingId && (d.status === 'open' || d.status === 'in-review'))
}

// Notification Management
export function getNotifications(): Notification[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(NOTIFICATIONS_KEY)
  return stored ? JSON.parse(stored) : []
}

export function saveNotifications(notifications: Notification[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications))
}

export function getUserNotifications(userId: string): Notification[] {
  const notifications = getNotifications()
  return notifications.filter(n => n.userId === userId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function getUnreadNotificationCount(userId: string): number {
  return getUserNotifications(userId).filter(n => !n.read).length
}

export function createNotification(notificationData: Omit<Notification, 'id' | 'createdAt'>): Notification {
  const notifications = getNotifications()
  const newNotification: Notification = {
    ...notificationData,
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  }
  notifications.push(newNotification)
  saveNotifications(notifications)
  return newNotification
}

export function markNotificationAsRead(notificationId: string): void {
  const notifications = getNotifications()
  const notif = notifications.find(n => n.id === notificationId)
  if (notif) {
    notif.read = true
    saveNotifications(notifications)
  }
}

export function markAllNotificationsAsRead(userId: string): void {
  const notifications = getNotifications()
  notifications.forEach(n => {
    if (n.userId === userId && !n.read) {
      n.read = true
    }
  })
  saveNotifications(notifications)
}