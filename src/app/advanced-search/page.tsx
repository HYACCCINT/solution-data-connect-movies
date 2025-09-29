/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { dc } from "@/lib/firebase";
import {
    searchMoviesFts, SearchMoviesFtsData
} from "@app/data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import MoviePoster from "@/components/movie-poster";
import MoviePosterPlaceholder from "@/components/movie-poster-placeholder";
import { SearchIcon } from "lucide-react";

export default function AdvancedSearchPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any>({plain: [], phrase:[], query:[], advanced:[]});
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const searchTerm = query.trim();
        if (!query) return;

        setIsLoading(true);
        setHasSearched(true);
        setResults(null);

        try{
            const res = await searchMoviesFts(dc, { query: searchTerm });
        setResults({
            plain: res.data.plain,
            phrase: res.data.phrase,
            query: res.data.query,
        });
        setIsLoading(false);
    }
        catch (error) {
            console.error("Error performing search:", error);
            setIsLoading(false);
            return null;
          }

    };

    /**
     * Renders a styled row for a specific category of movie results.
     */
    const renderMovieRow = (title: string, description: string, movies: any[]) => (
        <section className="mb-10">
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-muted-foreground text-sm mb-4">{description}</p>
            
            {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => <MoviePosterPlaceholder key={i} />)}
                </div>
            ) : movies && movies.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {movies.map((movie) => (
                        <div key={movie.id} className="space-y-2">
                            <MoviePoster movie={movie} />
                             <div>
                                <Link
                                    href={`/movies/${movie.id}`}
                                    className="font-bold line-clamp-1 hover:text-primary block"
                                >
                                    {movie.title}
                                </Link>
                                <span className="text-sm text-muted-foreground">
                                    {new Date(movie.releaseDate).getFullYear()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground">No results found for this search type.</p>
            )}
        </section>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Full-Text Search</h1>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto mb-12">
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                    <Label htmlFor="search-input" className="sr-only">Search Movies</Label>
                    <Input
                        id="search-input"
                        type="search"
                        placeholder="Search for movies..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-grow"
                    />
                    <Button type="submit" disabled={isLoading} className="min-w-[120px]" variant="outline">
                        <SearchIcon className="h-4 w-4 mr-2" />
                        {isLoading ? "Searching..." : "Search"}
                    </Button>
                </form>
            </div>

            {/* Results Display */}
            <div className="space-y-8">
                {hasSearched ? (
                    <>
                        {renderMovieRow(
                            "Plain Search Results",
                            "Matches any of the search terms (OR logic). Best for general searches.",
                            results?.plain || []
                        )}
                        {renderMovieRow(
                            "Phrase Search Results",
                            "Matches the exact sequence of words entered. Ideal for finding specific titles.",
                            results?.phrase || []
                        )}
                        {renderMovieRow(
                            "Query String Results",
                            "Supports operators like `+` (AND) and `-` (NOT) for more specific logic.",
                            results?.query || []
                        )}
                    </>
                ) : (
                     <div className="text-center py-12">
                        <p className="text-muted-foreground">
                            Enter a term in the search bar to see results from four different search methods.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}