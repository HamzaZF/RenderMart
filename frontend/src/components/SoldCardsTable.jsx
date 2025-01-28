import React from "react";
import PropTypes from "prop-types";
import { Table } from "flowbite-react";
import { format, parseISO } from "date-fns";

function SoldCardsTable({ soldCards }) {
  return (
    <main>
      <div className="overflow-x-auto p-6 w-full">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center justify-center">
          History
        </h2>
        <Table>
          <Table.Head>
            <Table.HeadCell>Image</Table.HeadCell>
            <Table.HeadCell>Price</Table.HeadCell>
            <Table.HeadCell>Buyer</Table.HeadCell>
            <Table.HeadCell>Date Sold</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {soldCards.length > 0 ? (
              soldCards.map((card) => {
                // Utilise parseISO pour convertir date_sold en objet Date
                let formattedDate = "Invalid Date";
                if (card.date_sold) { // Utilise `date_sold` directement
                  try {
                    const parsedDate = parseISO(card.date_sold); // Parse la date au format ISO
                    //formattedDate = format(parsedDate, "MMMM d, yyyy"); // Formate la date
                    formattedDate = new Date(card.date_sold).toLocaleString();
                    // Exemple : "1/27/2025, 2:30:00 PM"

                  } catch (error) {
                    console.error("Invalid date format:", card.date_sold);
                  }
                }

                return (
                  <Table.Row
                    key={card.id}
                    className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    <Table.Cell>
                      <img
                        src={card.image_url} // Utilise `image_url` comme dans l'objet backend
                        alt="Card"
                        className="h-12 w-12 rounded-md"
                      />
                    </Table.Cell>
                    <Table.Cell className="text-gray-900 dark:text-white">
                      ${card.price}
                    </Table.Cell>
                    <Table.Cell className="text-gray-500 dark:text-gray-400">
                      {card.buyer_name}
                    </Table.Cell>
                    <Table.Cell className="text-gray-500 dark:text-gray-400">
                      {formattedDate}
                    </Table.Cell>
                  </Table.Row>
                );
              })
            ) : (
              <Table.Row>
                <Table.Cell
                  colSpan={4}
                  className="text-center text-gray-500 dark:text-gray-400"
                >
                  No records found.
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>
    </main>
  );
}

SoldCardsTable.propTypes = {
  soldCards: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      image_url: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      buyer_name: PropTypes.string.isRequired,
      date_sold: PropTypes.string.isRequired, // Correspond au format backend
    })
  ).isRequired,
};

export default SoldCardsTable;
