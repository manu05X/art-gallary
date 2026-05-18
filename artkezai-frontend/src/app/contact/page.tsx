'use client';

import { useState } from 'react';
import { useCreateThread } from '@/lib/hooks/useMessages';
import { useAuthStore } from '@/lib/store/authStore';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const { isAuthenticated } = useAuthStore();
  const { mutate: createThread, isPending } = useCreateThread();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }

    if (isAuthenticated) {
      createThread(
        { subject: formData.subject, body: formData.message },
        {
          onSuccess: () => {
            setFormData({ name: '', email: '', subject: '', message: '' });
            toast.success('Message sent successfully!');
          },
        }
      );
    } else {
      toast.error('Please sign in to send a message');
    }
  };

  return (
    <div className="section container max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-brand mb-4 text-center">Contact Us</h1>
      <p className="text-gray-600 text-center mb-12">
        We'd love to hear from you. Send us a message and we'll respond as soon as possible.
      </p>

      <div className="bg-white rounded-lg shadow p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input"
                disabled={isPending}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input"
                disabled={isPending}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="input"
              disabled={isPending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              className="input resize-none"
              disabled={isPending}
            />
          </div>

          {!isAuthenticated && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                Please{' '}
                <a href="/auth/login" className="font-semibold hover:underline">
                  sign in
                </a>{' '}
                to send a message.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending || !isAuthenticated}
            className="w-full btn btn-primary disabled:opacity-50"
          >
            {isPending ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <div className="text-center">
          <h3 className="font-semibold text-brand mb-2">Email</h3>
          <p className="text-gray-600 text-sm">contact@artkezai.com</p>
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-brand mb-2">Response Time</h3>
          <p className="text-gray-600 text-sm">Usually within 24 hours</p>
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-brand mb-2">Available</h3>
          <p className="text-gray-600 text-sm">Monday - Friday, 9am - 5pm UTC</p>
        </div>
      </div>
    </div>
  );
}
