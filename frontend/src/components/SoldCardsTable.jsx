import React from "react";
import { Table } from "flowbite-react";

function SoldCardsTable({soldCards}) {
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
                {soldCards.map((card, index) => (
                    <Table.Row
                    key={index}
                    className="bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                    <Table.Cell>
                        <img
                        src={card.imageUrl}
                        alt="Card"
                        className="h-12 w-12 rounded-md"
                        />
                    </Table.Cell>
                    <Table.Cell className="text-gray-900 dark:text-white">
                        ${card.price}
                    </Table.Cell>
                    <Table.Cell className="text-gray-500 dark:text-gray-400">
                        {card.buyer}
                    </Table.Cell>
                    <Table.Cell className="text-gray-500 dark:text-gray-400">
                        {card.dateSold}
                    </Table.Cell>
                    </Table.Row>
                ))}
                </Table.Body>
            </Table>
        </div>
    </main>
  )
}

export default SoldCardsTable