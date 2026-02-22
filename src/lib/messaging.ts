import { supabase } from './supabase';

export async function getOrCreateConversation(userId1: string, userId2: string, carId?: string): Promise<string | null> {
  if (userId1 === userId2) {
    console.error('Cannot create conversation with yourself');
    return null;
  }

  const { data: existingConversations } = await supabase
    .from('conversations')
    .select('id, car_id')
    .eq('car_id', carId || null)
    .order('created_at', { ascending: false });

  if (existingConversations && existingConversations.length > 0) {
    for (const conv of existingConversations) {
      const { data: participants } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conv.id);

      if (participants && participants.length === 2) {
        const userIds = participants.map(p => p.user_id).sort();
        const targetUserIds = [userId1, userId2].sort();

        if (userIds[0] === targetUserIds[0] && userIds[1] === targetUserIds[1]) {
          return conv.id;
        }
      }
    }
  }

  const { data: conversationId, error: convError } = await supabase
    .rpc('create_conversation_with_participants', {
      user_id_1: userId1,
      user_id_2: userId2,
      p_car_id: carId || null
    });

  if (convError || !conversationId) {
    console.error('Error creating conversation:', convError);
    return null;
  }

  return conversationId;
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  receiverId: string,
  content: string,
  messageType: string = 'text',
  swapOfferId?: string
): Promise<boolean> {
  const messageData: any = {
    conversation_id: conversationId,
    sender_id: senderId,
    receiver_id: receiverId,
    content: content,
    message_type: messageType,
  };

  if (swapOfferId) {
    messageData.swap_offer_id = swapOfferId;
  }

  const { error } = await supabase
    .from('messages')
    .insert([messageData]);

  if (error) {
    console.error('Error sending message:', error);
    return false;
  }

  const { data: senderProfile } = await supabase
    .from('user_profiles')
    .select('is_premium')
    .eq('id', senderId)
    .maybeSingle();

  if (senderProfile?.is_premium) {
    try {
      const { data: conversation } = await supabase
        .from('conversations')
        .select('car_id')
        .eq('id', conversationId)
        .maybeSingle();

      let carTitle = undefined;
      if (conversation?.car_id) {
        const { data: car } = await supabase
          .from('cars')
          .select('brand, model, year')
          .eq('id', conversation.car_id)
          .maybeSingle();

        if (car) {
          carTitle = `${car.brand} ${car.model} (${car.year})`;
        }
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      await fetch(`${supabaseUrl}/functions/v1/send-message-notification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender_id: senderId,
          receiver_id: receiverId,
          car_id: conversation?.car_id,
          message: content,
          car_title: carTitle,
        }),
      });
    } catch (emailError) {
      // Email notification failed (non-critical)
    }
  }

  return true;
}
