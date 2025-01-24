import React from "react";
import SoldCardsTable from "./SoldCardsTable";
import { soldCards } from "../constants/index";

function History() {

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <SoldCardsTable soldCards={soldCards} />
    </main>
  );
}

export default History;
