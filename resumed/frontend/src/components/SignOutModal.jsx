"use client";

import { Modal, Button } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

function SignOutModal({ isOpen, onClose, onConfirm }) {
  return (
    <Modal show={isOpen} size="md" onClose={onClose} popup>
      <Modal.Header />
      <Modal.Body>
        <div className="text-center">
          <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            Are you sure you want to sign out?
          </h3>
          <div className="flex justify-center gap-4">
            {/* Bouton pour confirmer la déconnexion */}
            <Button color="failure" onClick={onConfirm}>
              {"Yes, Sign Out"}
            </Button>
            {/* Bouton pour annuler */}
            <Button color="gray" onClick={onClose}>
              No, Cancel
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default SignOutModal;
