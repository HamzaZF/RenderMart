import React, { useState } from 'react';
import { Button, Modal, TextInput, Label } from 'flowbite-react';
import { HiOutlineCurrencyDollar } from 'react-icons/hi';

function ModalPriceCard({ isOpen, onClose, onSubmit }) {
  const [price, setPrice] = useState('0');

  const handleSubmit = () => {
    if (price.trim() !== '') {
      onSubmit(price); // Appelle une fonction pour soumettre le montant
      onClose(); // Ferme le modal après soumission
    } else {
      alert("Please enter a valid price."); // Validation simple
    }
  };

  return (
    <main>
      <Modal show={isOpen} size="md" onClose={onClose} popup>
        <Modal.Header>
          {/* <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            Specify Price
          </h3> */}
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-col items-center">
            <HiOutlineCurrencyDollar className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Enter the price for listing your card:
            </h3>

            {/* Input field for price */}
            <div className="w-full">
              <Label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Price (in USD)
              </Label>
              <TextInput
                id="price"
                type="number"
                placeholder="Enter price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-4 mt-6">
              <Button color="success" onClick={handleSubmit}>
                Confirm
              </Button>
              <Button color="gray" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </main>
  );
}

export default ModalPriceCard;
