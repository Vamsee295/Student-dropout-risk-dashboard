/**
 * messageService.ts
 * Axios wrappers for the Student ↔ Faculty Messaging API.
 */
import apiClient from "@/api/axios";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ConversationParticipant {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email: string;
}

export interface ConversationListItem {
  id: number;
  student: ConversationParticipant;
  faculty: ConversationParticipant;
  last_message: string | null;
  last_message_time: string | null;
  unread_count: number;
}

export interface MessageResponse {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_role: string;
  sender_name: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface ConversationDetail {
  id: number;
  student: ConversationParticipant;
  faculty: ConversationParticipant;
  messages: MessageResponse[];
}

export interface FacultyContact {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

// ── Service ────────────────────────────────────────────────────────────────────

export const messageService = {
  /** Return all conversations for the logged-in user. */
  async getConversations(): Promise<ConversationListItem[]> {
    const { data } = await apiClient.get("/messages/conversations");
    return data;
  },

  /** Get or create a conversation with a faculty member (called by student). */
  async createConversationWithFaculty(facultyId: number): Promise<ConversationListItem> {
    const { data } = await apiClient.post("/messages/conversations", { faculty_id: facultyId });
    return data;
  },

  /** Get or create a conversation with a student (called by faculty). */
  async createConversationWithStudent(studentId: string): Promise<ConversationListItem> {
    const { data } = await apiClient.post("/messages/conversations", { student_id: studentId });
    return data;
  },

  /** Fetch full message history for a conversation. */
  async getConversation(conversationId: number): Promise<ConversationDetail> {
    const { data } = await apiClient.get(`/messages/conversations/${conversationId}`);
    return data;
  },

  /** Send a message in a conversation. */
  async sendMessage(conversationId: number, content: string): Promise<MessageResponse> {
    const { data } = await apiClient.post(
      `/messages/conversations/${conversationId}/messages`,
      { content }
    );
    return data;
  },

  /** Mark all incoming unread messages in a conversation as read. */
  async markAsRead(conversationId: number): Promise<void> {
    await apiClient.patch(`/messages/conversations/${conversationId}/read`);
  },

  /** List available faculty contacts for the student to message. */
  async getAvailableFaculty(): Promise<FacultyContact[]> {
    const { data } = await apiClient.get("/messages/faculty-list");
    return data;
  },
};
