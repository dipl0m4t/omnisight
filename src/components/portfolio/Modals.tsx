// Deleting Modal
export const DeleteModal = ({
  theme,
  confirmDeleteAsset,
  setAssetToDelete,
}: any) => (
  <div
    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4"
    onClick={() => setAssetToDelete(null)}
  >
    <div
      className={`w-full max-w-sm p-8 rounded-[32px] border thick-glass refractive-distortion shadow-2xl animate-content-reveal text-center ${theme === "dark" ? "bg-zinc-900/95 border-red-500/20" : "bg-white/95 border-red-500/20"}`}
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-xl font-black uppercase tracking-widest mb-2 text-zinc-900 dark:text-white mt-4">
        Delete Asset
      </h3>
      <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-8">
        Are you sure you want to remove this asset? This action cannot be
        undone.
      </p>
      <div className="flex gap-4 font-mono">
        <button
          onClick={() => setAssetToDelete(null)}
          className="flex-1 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={confirmDeleteAsset}
          className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

// Adding Modal
export const AddAssetModal = ({
  theme,
  handleAddAsset,
  setIsAddModalOpen,
  newAsset,
  setNewAsset,
  modalSearchQuery,
  setModalSearchQuery,
  searchResults,
  setSearchResults,
  isSearching,
  selectedCoinName,
  setSelectedCoinName,
}: any) => (
  <div
    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4"
    onClick={() => setIsAddModalOpen(false)}
  >
    <div
      className={`w-full max-w-md p-8 rounded-[32px] border thick-glass refractive-distortion shadow-2xl animate-content-reveal ${theme === "dark" ? "bg-zinc-900/95 border-white/[0.1]" : "bg-white/95 border-zinc-200"}`}
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-xl font-black uppercase tracking-widest mb-6 text-center text-zinc-900 dark:text-white">
        Add New Asset
      </h3>

      <form onSubmit={handleAddAsset} className="flex flex-col gap-5 font-mono">
        {/* Smart asset search */}
        <div className="flex flex-col gap-2 relative">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Search Asset
          </label>
          <input
            type="text"
            required
            placeholder="Type coin name (e.g. Bitcoin)..."
            value={selectedCoinName || modalSearchQuery}
            onChange={(e) => {
              setSelectedCoinName("");
              setNewAsset({ ...newAsset, coinId: "" });
              setModalSearchQuery(e.target.value);
            }}
            className={`w-full p-4 rounded-2xl border outline-none transition-colors font-bold
              ${
                theme === "dark"
                  ? "bg-black/50 border-white/10 text-white focus:border-emerald-500/50"
                  : "bg-zinc-50 border-zinc-300 text-black focus:border-emerald-500"
              }`}
          />

          {/* Results pop-up menu */}
          {!selectedCoinName && modalSearchQuery.length >= 2 && (
            <div
              className={`absolute top-full mt-2 left-0 right-0 z-[300] rounded-xl border overflow-hidden shadow-2xl
                ${
                  theme === "dark"
                    ? "bg-zinc-900 border-zinc-700"
                    : "bg-white border-zinc-200"
                }`}
            >
              {isSearching ? (
                <div className="p-4 text-center text-xs text-zinc-500 font-mono animate-pulse">
                  Searching global registry...
                </div>
              ) : searchResults.length > 0 ? (
                <ul className="max-h-48 overflow-y-auto">
                  {searchResults.map((coin: any) => (
                    <li
                      key={coin.id}
                      onClick={() => {
                        setNewAsset({ ...newAsset, coinId: coin.id });
                        setSelectedCoinName(
                          `${coin.name} (${coin.symbol.toUpperCase()})`,
                        );
                        setModalSearchQuery("");
                        setSearchResults([]);
                      }}
                      className="p-3 border-b border-zinc-200 dark:border-white/5 hover:bg-zinc-800 dark:hover:bg-white/10 cursor-pointer flex items-center gap-4 transition-colors"
                    >
                      <img
                        src={coin.thumb}
                        alt={coin.name}
                        className="w-7 h-7 rounded-full bg-zinc-800"
                      />
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {coin.name}
                      </span>
                      <span className="text-[10px] font-black tracking-widest text-zinc-500">
                        {coin.symbol.toUpperCase()}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-xs text-zinc-500 font-mono bg-zinc-900/50">
                  No assets found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Invested Amount */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Invested Amount (USD)
          </label>
          <input
            type="number"
            step="any"
            min="0"
            required
            placeholder="e.g. 1000"
            value={newAsset.invested || ""}
            onChange={(e) =>
              setNewAsset({ ...newAsset, invested: e.target.value })
            }
            className={`w-full p-4 rounded-2xl border outline-none transition-colors font-bold
              ${
                theme === "dark"
                  ? "bg-black/50 border-white/10 text-white focus:border-emerald-500/50"
                  : "bg-zinc-50 border-zinc-300 text-black focus:border-emerald-500"
              }`}
          />
        </div>

        {/* Buy Price */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Buy Price (USD)
          </label>
          <input
            type="number"
            step="any"
            min="0"
            required
            placeholder="e.g. 126000"
            value={newAsset.buyPrice || ""}
            onChange={(e) =>
              setNewAsset({ ...newAsset, buyPrice: e.target.value })
            }
            className={`w-full p-4 rounded-2xl border outline-none transition-colors font-bold
              ${theme === "dark" ? "bg-black/50 border-white/10 text-white focus:border-emerald-500/50" : "bg-zinc-50 border-zinc-300 text-black focus:border-emerald-500"}`}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex gap-4 mt-4 pt-4 border-t border-zinc-200 dark:border-white/10">
          <button
            type="button"
            onClick={() => {
              setIsAddModalOpen(false);
              setModalSearchQuery("");
              setSelectedCoinName("");
              setSearchResults([]);
            }}
            className="flex-1 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest bg-emerald-500 text-black hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all cursor-pointer"
          >
            Save Asset
          </button>
        </div>
      </form>
    </div>
  </div>
);

// Editing Modal
export const EditAssetModal = ({
  theme,
  editingAsset,
  setEditingAsset,
  handleUpdateAsset,
  setIsEditModalOpen,
}: any) => (
  <div
    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4"
    onClick={() => setIsEditModalOpen(false)}
  >
    <div
      className={`w-full max-w-md p-8 rounded-[32px] border thick-glass refractive-distortion shadow-2xl animate-content-reveal ${theme === "dark" ? "bg-zinc-900/95 border-emerald-500/20" : "bg-white/95 border-emerald-500/20"}`}
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-xl font-black uppercase tracking-widest mb-1 text-center text-zinc-900 dark:text-white">
        Edit Asset
      </h3>
      <p className="text-center text-emerald-500 font-bold tracking-widest mb-6">
        {editingAsset.coinId}
      </p>

      <form
        onSubmit={handleUpdateAsset}
        className="flex flex-col gap-5 font-mono"
      >
        {/* Change the Invested amount */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Invested Amount (USD)
          </label>
          <input
            type="number"
            step="any"
            min="0"
            required
            value={editingAsset.invested || ""}
            onChange={(e) =>
              setEditingAsset({
                ...editingAsset,
                invested: e.target.value,
              })
            }
            className={`w-full p-4 rounded-2xl border outline-none transition-colors font-bold
              ${
                theme === "dark"
                  ? "bg-black/50 border-white/10 text-white focus:border-emerald-500/50"
                  : "bg-zinc-50 border-zinc-300 text-black focus:border-emerald-500"
              }`}
          />
        </div>

        {/* Change the Buy price */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Average Buy Price (USD)
          </label>
          <input
            type="number"
            step="any"
            min="0"
            required
            value={editingAsset.buyPrice || ""}
            onChange={(e) =>
              setEditingAsset({
                ...editingAsset,
                buyPrice: e.target.value,
              })
            }
            className={`w-full p-4 rounded-2xl border outline-none transition-colors font-bold
              ${
                theme === "dark"
                  ? "bg-black/50 border-white/10 text-white focus:border-emerald-500/50"
                  : "bg-zinc-50 border-zinc-300 text-black focus:border-emerald-500"
              }`}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-4 pt-4 border-t border-zinc-200 dark:border-white/10">
          <button
            type="button"
            onClick={() => {
              setIsEditModalOpen(false);
              setEditingAsset(null);
            }}
            className="flex-1 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest bg-emerald-500 text-black hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all cursor-pointer"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  </div>
);
