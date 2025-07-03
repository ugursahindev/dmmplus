'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardBody,
  User,
  Input,
  Button,
  Avatar,
  Badge,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Autocomplete,
  AutocompleteItem,
  Chip,
  ScrollShadow,
} from '@nextui-org/react';
import {
  Send,
  Search,
  Plus,
  MessageSquare,
  Users,
  Check,
  CheckCheck,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Conversation {
  id: number;
  title: string | null;
  isGroup: boolean;
  lastMessageAt: string;
  lastMessageText: string | null;
  unreadCount: number;
  participants: {
    id: number;
    user: {
      id: number;
      fullName: string;
      username: string;
      role: string;
    };
  }[];
  messages: {
    id: number;
    content: string;
    createdAt: string;
    sender: {
      id: number;
      fullName: string;
      username: string;
    };
  }[];
  _count: {
    messages: number;
  };
}

interface Message {
  id: number;
  content: string;
  createdAt: string;
  isEdited: boolean;
  sender: {
    id: number;
    fullName: string;
    username: string;
    role: string;
  };
  readBy: {
    id: number;
    user: {
      id: number;
      fullName: string;
    };
  }[];
}

interface UserData {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: string;
}

export default function MessagesPage() {
  const { user, token } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [conversationTitle, setConversationTitle] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (token) {
      fetchConversations();
    }
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [token]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      // Start polling for new messages
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      pollingIntervalRef.current = setInterval(() => {
        fetchMessages(selectedConversation.id, true);
      }, 3000);
      
      // Mark messages as read when conversation is selected
      markMessagesAsRead();
    } else {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    }
    
    // Cleanup on unmount or when selectedConversation changes
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const response = await fetch('/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      
      const data = await response.json();
      setConversations(data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Konuşmalar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: number, silent = false) => {
    try {
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const response = await fetch(`/api/messages/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      const conv = data.conversation;
      setMessages(conv.messages);
      
      // Update conversation in list
      setConversations(prev => prev.map(c => 
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      ));
    } catch (error) {
      if (!silent) {
        console.error('Error fetching messages:', error);
        toast.error('Mesajlar yüklenirken hata oluştu');
      }
    }
  };

  const fetchUsers = async (search: string) => {
    try {
      setSearchingUsers(true);
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const response = await fetch(`/api/messages/users?search=${search}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleModalOpen = () => {
    onOpen();
    // Modal açıldığında tüm kullanıcıları yükle
    fetchUsers('');
    // State'leri temizle
    setSelectedUsers([]);
    setConversationTitle('');
    setUserSearchQuery('');
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSendingMessage(true);
    try {
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: newMessage
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      setMessages([...messages, data.message]);
      setNewMessage('');
      
      // Update last message in conversation list
      setConversations(prev => prev.map(c => 
        c.id === selectedConversation.id 
          ? { ...c, lastMessageText: newMessage, lastMessageAt: new Date().toISOString() }
          : c
      ));
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Mesaj gönderilirken hata oluştu');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleCreateConversation = async () => {
    if (selectedUsers.length === 0) {
      toast.error('En az bir kullanıcı seçmelisiniz');
      return;
    }

    // Grup konuşması için title zorunlu
    if (selectedUsers.length > 1 && !conversationTitle.trim()) {
      toast.error('Grup konuşması için başlık zorunludur');
      return;
    }

    try {
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const response = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          participantIds: selectedUsers,
          title: conversationTitle.trim() || null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      const data = await response.json();
      
      if (!data.existing) {
        setConversations([data.conversation, ...conversations]);
      }
      
      setSelectedConversation(data.conversation);
      setSelectedUsers([]);
      setUsers([]);
      setUserSearchQuery('');
      setConversationTitle('');
      onClose();
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Konuşma oluşturulurken hata oluştu');
    }
  };

  const markMessagesAsRead = async () => {
    if (!selectedConversation || !user) return;

    try {
      const unreadMessages = messages.filter(
        message => message.sender.id !== user.id && 
        !message.readBy.some(read => read.user.id === user.id)
      );

      if (unreadMessages.length === 0) return;

      if (!token) {
        throw new Error('No authentication token');
      }
      
      const response = await fetch('/api/messages/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          messageIds: unreadMessages.map(m => m.id),
          conversationId: selectedConversation.id,
        }),
      });

      if (response.ok) {
        // Update messages to mark them as read
        setMessages(prev => prev.map(message => ({
          ...message,
          readBy: unreadMessages.some(m => m.id === message.id) 
            ? [...message.readBy, { id: 0, user: { id: user.id, fullName: user.fullName } }]
            : message.readBy
        })));
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.title) return conversation.title;
    
    const otherParticipants = conversation.participants
      .filter(p => p.user && p.user.id !== user?.id)
      .map(p => p.user?.fullName)
      .filter(Boolean);
    
    return otherParticipants.join(', ') || 'Konuşma';
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      'ADMIN': 'Yönetici',
      'IDP_PERSONNEL': 'IDP Personeli',
      'LEGAL_PERSONNEL': 'Hukuk Personeli',
      'INSTITUTION_USER': 'Kurum Sorumlusu'
    };
    return labels[role] || role;
  };

  const formatMessageTime = (date: string) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return format(messageDate, 'HH:mm');
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Dün ' + format(messageDate, 'HH:mm');
    } else {
      return format(messageDate, 'dd MMM HH:mm', { locale: tr });
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const title = getConversationTitle(conv).toLowerCase();
    return title.includes(searchQuery.toLowerCase());
  });

  return (
    <DashboardLayout allowedRoles={['ADMIN', 'IDP_PERSONNEL', 'LEGAL_PERSONNEL', 'INSTITUTION_USER']}>
      <div className="h-[calc(100vh-6rem)]">
        <div className="grid grid-cols-12 gap-4 h-full">
          {/* Conversations List */}
          <div className="col-span-4 h-full">
            <Card className="h-full">
              <CardBody className="p-0 flex flex-col h-full">
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Mesajlar</h2>
                    <Button
                      isIconOnly
                      color="primary"
                      size="sm"
                      onPress={handleModalOpen}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Konuşma ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    startContent={<Search className="w-4 h-4 text-default-400" />}
                  />
                </div>
                
                <Divider />
                
                <ScrollShadow className="flex-1">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="text-center py-8 text-default-500">
                      Henüz konuşma yok
                    </div>
                  ) : (
                    <div>
                      {filteredConversations.map((conv, index) => {
                        const isSelected = selectedConversation?.id === conv.id;
                        const otherParticipant = conv.participants.find(p => p.user?.id !== user?.id);
                        
                        return (
                          <div key={conv.id}>
                            <div
                              className={`p-4 cursor-pointer hover:bg-default-50 transition-colors ${isSelected ? 'bg-primary-50' : ''}`}
                              onClick={() => setSelectedConversation(conv)}
                            >
                              <div className="flex items-start gap-3">
                                <Badge
                                  content={conv.unreadCount > 0 ? conv.unreadCount : null}
                                  color="danger"
                                  size="sm"
                                  isInvisible={conv.unreadCount === 0}
                                >
                                  {conv.isGroup ? (
                                    <Avatar
                                      icon={<Users />}
                                      className="bg-primary-100"
                                    />
                                  ) : (
                                    <Avatar
                                      name={otherParticipant?.user.fullName}
                                      size="md"
                                    />
                                  )}
                                </Badge>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start">
                                    <p className="font-medium truncate">
                                      {getConversationTitle(conv)}
                                    </p>
                                    <span className="text-xs text-default-400 ml-2">
                                      {formatMessageTime(conv.lastMessageAt)}
                                    </span>
                                  </div>
                                  {conv.lastMessageText && (
                                    <p className="text-sm text-default-500 truncate">
                                      {conv.lastMessageText}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            {index < filteredConversations.length - 1 && <Divider />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollShadow>
              </CardBody>
            </Card>
          </div>

          {/* Messages View */}
          <div className="col-span-8 h-full">
            <Card className="h-full">
              {selectedConversation ? (
                <CardBody className="p-0 flex flex-col h-full">
                  {/* Header */}
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                      {selectedConversation.isGroup ? (
                        <Avatar
                          icon={<Users />}
                          className="bg-primary-100"
                        />
                      ) : (
                        <Avatar
                          name={selectedConversation.participants.find(p => p.user?.id !== user?.id)?.user?.fullName}
                        />
                      )}
                      <div>
                        <p className="font-medium">{getConversationTitle(selectedConversation)}</p>
                        {selectedConversation.isGroup ? (
                          <p className="text-sm text-default-500">
                            {selectedConversation.participants
                              .filter(p => p.user && p.user.id !== user?.id)
                              .map(p => p.user.fullName)
                              .join(', ')
                            }
                            {selectedConversation.participants.length > 1 && (
                              <span> ({selectedConversation.participants.length} katılımcı)</span>
                            )}
                          </p>
                        ) : (
                          <p className="text-sm text-default-500">
                            {selectedConversation.participants.length} katılımcı
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollShadow className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isOwn = message.sender.id === user?.id;
                        
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                              {!isOwn && (
                                <p className="text-xs text-default-500 mb-1">
                                  {message.sender.fullName}
                                </p>
                              )}
                              <Card className={isOwn ? 'bg-primary' : 'bg-default-100'}>
                                <CardBody className="py-2 px-3">
                                  <p className={`text-sm ${isOwn ? 'text-white' : ''}`}>
                                    {message.content}
                                  </p>
                                  <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                                    <span className={`text-xs ${isOwn ? 'text-primary-200' : 'text-default-400'}`}>
                                      {format(new Date(message.createdAt), 'HH:mm')}
                                    </span>
                                    {isOwn && (
                                      message.readBy.length > 1 ? (
                                        <CheckCheck className="w-3 h-3 text-primary-200" />
                                      ) : (
                                        <Check className="w-3 h-3 text-primary-200" />
                                      )
                                    )}
                                  </div>
                                </CardBody>
                              </Card>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollShadow>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Mesajınızı yazın..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button
                        isIconOnly
                        color="primary"
                        onPress={handleSendMessage}
                        isLoading={sendingMessage}
                        isDisabled={!newMessage.trim()}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardBody>
              ) : (
                <CardBody className="flex items-center justify-center">
                  <MessageSquare className="w-16 h-16 text-default-300 mb-4" />
                  <p className="text-default-500">Bir konuşma seçin veya yeni konuşma başlatın</p>
                </CardBody>
              )}
            </Card>
          </div>
        </div>

        {/* New Conversation Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>Yeni Konuşma</ModalHeader>
                <ModalBody>
                  <div className="space-y-4">
                    <Input
                      label="Konuşma Başlığı (Opsiyonel)"
                      placeholder="Grup konuşması için başlık girin..."
                      value={conversationTitle}
                      onChange={(e) => setConversationTitle(e.target.value)}
                      description={selectedUsers.length > 1 ? "Grup konuşması için başlık zorunludur" : "İki kişilik konuşma için boş bırakabilirsiniz"}
                    />
                    
                    <Autocomplete
                      label="Kullanıcı Seç"
                      placeholder="Kullanıcı ara..."
                      isLoading={searchingUsers}
                      value={userSearchQuery}
                      onInputChange={(value) => {
                        setUserSearchQuery(value);
                        fetchUsers(value);
                      }}
                      startContent={<Search className="w-4 h-4 text-default-400" />}
                    >
                    {users.map((u) => (
                      <AutocompleteItem
                        key={u.id}
                        value={u.id}
                        onPress={() => {
                          if (!selectedUsers.includes(u.id)) {
                            setSelectedUsers([...selectedUsers, u.id]);
                          }
                        }}
                      >
                        <User
                          name={u.fullName}
                          description={`${u.username} - ${getRoleLabel(u.role)}`}
                          avatarProps={{
                            name: u.fullName,
                            size: "sm"
                          }}
                        />
                      </AutocompleteItem>
                    ))}
                  </Autocomplete>

                  {selectedUsers.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-default-500 mb-2">Seçilen Kullanıcılar:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedUsers.map((userId) => {
                          const u = users.find(user => user.id === userId);
                          return u ? (
                            <Chip
                              key={userId}
                              onClose={() => setSelectedUsers(selectedUsers.filter(id => id !== userId))}
                              variant="flat"
                            >
                              {u.fullName}
                            </Chip>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    İptal
                  </Button>
                  <Button 
                    color="primary" 
                    onPress={handleCreateConversation}
                    isDisabled={selectedUsers.length === 0 || (selectedUsers.length > 1 && !conversationTitle.trim())}
                  >
                    {selectedUsers.length > 1 ? 'Grup Konuşması Başlat' : 'Konuşma Başlat'}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </DashboardLayout>
  );
}