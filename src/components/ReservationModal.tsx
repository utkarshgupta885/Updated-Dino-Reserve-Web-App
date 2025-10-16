import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reservation: {
    customerName: string;
    phone: string;
    partySize: number;
    reservationTime: string;
  }) => void;
  tableNumber: number;
}

export function ReservationModal({ isOpen, onClose, onConfirm, tableNumber }: ReservationModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [reservationTime, setReservationTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerName && phone && reservationTime) {
      onConfirm({
        customerName,
        phone,
        partySize,
        reservationTime
      });
      // Reset form
      setCustomerName('');
      setPhone('');
      setPartySize(2);
      setReservationTime('');
      onClose();
    }
  };

  const timeSlots = [
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-green-50 to-yellow-50 dark:from-gray-800 dark:to-gray-900 border-2 dark:border-green-700">
        <DialogHeader>
          <div className="text-center mb-2">
            <div className="text-4xl mb-2">🍽️</div>
            <DialogTitle className="text-green-700 dark:text-green-400">
              Reserve Table {tableNumber}
            </DialogTitle>
            <DialogDescription className="dark:text-gray-300">
              Feed our hungry dino! Fill in the reservation details below.
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerName" className="dark:text-gray-200">Customer Name</Label>
            <Input
              id="customerName"
              placeholder="e.g., Dr. Alan Grant"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="border-green-200 dark:border-green-700 focus:border-green-400 dark:focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="dark:text-gray-200">Phone Number</Label>
            <Input
              id="phone"
              placeholder="e.g., (555) 123-DINO"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border-green-200 dark:border-green-700 focus:border-green-400 dark:focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="partySize" className="dark:text-gray-200">Party Size</Label>
            <Select value={partySize.toString()} onValueChange={(value) => setPartySize(parseInt(value))}>
              <SelectTrigger className="border-green-200 dark:border-green-700 focus:border-green-400 dark:focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                <SelectValue placeholder="How many hungry dinos?" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
                  <SelectItem key={size} value={size.toString()} className="dark:text-gray-100 dark:focus:bg-gray-700">
                    {size} {size === 1 ? 'dino' : 'dinos'} 🦕
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reservationTime" className="dark:text-gray-200">Feeding Time</Label>
            <Select value={reservationTime} onValueChange={setReservationTime} required>
              <SelectTrigger className="border-green-200 dark:border-green-700 focus:border-green-400 dark:focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                <SelectValue placeholder="When should we serve?" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time} className="dark:text-gray-100 dark:focus:bg-gray-700">
                    {time} 🕐
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              🦴 Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
            >
              🍖 Feed Dino!
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}