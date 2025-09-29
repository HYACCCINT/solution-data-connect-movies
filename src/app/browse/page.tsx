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
/**
 * Browse Movies Page
 * Displays a grid of movies with filtering options in a sidebar
 */

import { useEffect, useState} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { dc } from "@/lib/firebase";
import { browseMovies } from "@app/data";
import { BrowseMoviesData } from "@app/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import MoviePoster from "@/components/movie-poster";
import MoviePosterPlaceholder from "@/components/movie-poster-placeholder";
import { Star } from "lucide-react";

// Available genres for filtering
const GENRES = [
    "Action",
    "Adventure",
    "Comedy",
    "Drama",
    "Thriller",
    "Sci-Fi",
    "Horror",
    "Rom-Com",
    "Mystery",
    "Western",
    "Animation",
    "Musical",
];

// Filter interface
interface Filters {
    title?: string;
    minYear?: string;
    maxYear?: string;
    minRating?: number;
    genres?: string[];
}

export default function BrowsePage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State for filters that are selected in the UI but not yet applied
    const [pendingFilters, setPendingFilters] = useState<Filters>({});
    
    // State for the movie data, loading status, and errors
    const [moviesData, setMoviesData] = useState<BrowseMoviesData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // When the page loads, sync the UI filters with the URL params
    useEffect(() => {
        const newFilters: Filters = {};
        const titleParam = searchParams.get("title");
        const minYearParam = searchParams.get("minYear");
        const maxYearParam = searchParams.get("maxYear");
        const minRatingParam = searchParams.get("minRating");
        const genresParam = searchParams.get("genres");

        if (titleParam) newFilters.title = titleParam;
        if (minYearParam) newFilters.minYear = minYearParam;
        if (maxYearParam) newFilters.maxYear = maxYearParam;
        if (minRatingParam) newFilters.minRating = Number(minRatingParam);
        if (genresParam) newFilters.genres = genresParam.split(",");

        setPendingFilters(newFilters);
    }, [searchParams]);

    useEffect(() => {
        const fetchMovies = async () => {
            setIsLoading(true);

            const queryVariables: Record<string, any> = {};
            const title = searchParams.get("title");
            const minYear = searchParams.get("minYear");
            const maxYear = searchParams.get("maxYear");
            const minRating = searchParams.get("minRating");
            const genres = searchParams.get("genres");

            if (title) queryVariables.partialTitle = title;
            if (minYear) queryVariables.minDate = `${minYear}-01-01`;
            if (maxYear) queryVariables.maxDate = `${maxYear}-12-31`;
            if (minRating) queryVariables.minRating = Number(minRating) * 2;
            if (genres) queryVariables.genres = genres.split(",");
            const data = await browseMovies(dc, queryVariables);
            setMoviesData(data.data || null);
            setIsLoading(false);
        };

        fetchMovies();
    }, [searchParams]);

    // Update a single pending filter
    const updatePendingFilter = (key: keyof Filters, value: any) => {
        setPendingFilters((prev) => {
            const newFilters = { ...prev };
// If value is empty/null/undefined, delete the key
            if (
                value === "" ||
                value === null ||
                value === undefined ||
                (Array.isArray(value) && value.length === 0)
            ) {
                delete newFilters[key];
            } else {
                newFilters[key] = value;
            }

            return newFilters;
        });
    };
    
    // Apply the pending filters by updating the URL, which then triggers the useEffect
    const handleApplyFilters = () => {
        const params = new URLSearchParams();

        Object.entries(pendingFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                if (key === "genres" && Array.isArray(value) && value.length > 0) {
                    params.set(key, value.join(","));
                } else if (key !== "genres") {
                    params.set(key, String(value));
                }
            }
        });

        const queryString = params.toString();
    
        router.push(`/browse${queryString ? `?${queryString}` : ""}`, { scroll: false });
    };

    // Handle genre checkbox changes
    const handleGenreChange = (genre: string, checked: boolean) => {
        const currentGenres = pendingFilters.genres || [];

        if (checked) {
            updatePendingFilter("genres", [...currentGenres, genre]);
        } else {
            updatePendingFilter(
                "genres",
                currentGenres.filter((g) => g !== genre),
            );
        }
    };

    // Handle star rating selection
    const handleRatingClick = (rating: number) => {
        if (pendingFilters.minRating === rating) {
            updatePendingFilter("minRating", undefined);
        } else {
            updatePendingFilter("minRating", rating);
        }
    };

    // Render star rating selector
    const StarRating = () => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                        key={rating}
                        type="button"
                        onClick={() => handleRatingClick(rating)}
                        className={`focus:outline-none ${
                            pendingFilters.minRating !== undefined && rating <= pendingFilters.minRating
                                ? "text-yellow-500"
                                : "text-gray-300"
                        }`}
                    >
                        <Star className="h-6 w-6" />
                    </button>
                ))}
            </div>
        );
    };

    // Handle reset all filters
    const handleResetFilters = () => {
        setPendingFilters({});
        router.push("/browse", { scroll: false });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Browse Movies</h1>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Filters */}
                <div className="w-full md:w-64 shrink-0">
                    <div className="bg-card rounded-lg p-4 shadow-sm border border-border sticky top-4">
                        <h2 className="font-semibold text-lg mb-4">Filters</h2>

                        {/* Title filter */}
                        <div className="mb-6">
                            <Label htmlFor="title" className="mb-2 block">
                                Title
                            </Label>
                            <Input
                                id="title"
                                placeholder="Search by title"
                                value={pendingFilters.title || ""}
                                onChange={(e) => updatePendingFilter("title", e.target.value)}
                                className="w-full"
                            />
                        </div>

                        {/* Year range filter */}
                        <div className="mb-6">
                            <Label className="mb-2 block">Release Year</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Min"
                                    type="number"
                                    min="1900"
                                    max="2099"
                                    value={pendingFilters.minYear || ""}
                                    onChange={(e) => updatePendingFilter("minYear", e.target.value)}
                                    className="w-full"
                                />
                                <Input
                                    placeholder="Max"
                                    type="number"
                                    min="1900"
                                    max="2099"
                                    value={pendingFilters.maxYear || ""}
                                    onChange={(e) => updatePendingFilter("maxYear", e.target.value)}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* Rating filter */}
                        <div className="mb-6">
                            <Label className="mb-2 block">Minimum Rating</Label>
                            <StarRating />
                            {pendingFilters.minRating !== undefined && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mt-1 h-7 px-2 text-xs"
                                    onClick={() => updatePendingFilter("minRating", undefined)}
                                >
                                    Clear
                                </Button>
                            )}
                        </div>

                        {/* Genres filter */}
                        <div className="mb-6">
                            <Label className="mb-2 block">Genres</Label>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {GENRES.map((genre) => (
                                    <div key={genre} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`genre-${genre}`}
                                            checked={(pendingFilters.genres || []).includes(genre)}
                                            onCheckedChange={(checked: boolean | "indeterminate") =>
                                                handleGenreChange(genre, checked === true)
                                            }
                                        />
                                        <Label
                                            htmlFor={`genre-${genre}`}
                                            className="text-sm font-normal cursor-pointer"
                                        >
                                            {genre}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            {pendingFilters.genres && pendingFilters.genres.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mt-2 h-7 px-2 text-xs"
                                    onClick={() => updatePendingFilter("genres", [])}
                                >
                                    Clear All
                                </Button>
                            )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="space-y-2">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={handleApplyFilters}
                            >
                                Search
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={handleResetFilters}
                            >
                                Reset All Filters
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Movie Grid */}
                <div className="flex-1">
                    {isLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <MoviePosterPlaceholder />
                                    <div className="h-5 bg-muted rounded w-3/4"></div>
                                    <div className="h-4 bg-muted rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {moviesData?.movies && moviesData.movies.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {moviesData.movies.map((movie: BrowseMoviesData["movies"][0]) => (
                                        <div key={movie.id} className="space-y-2">
                                            <MoviePoster movie={movie} />
                                            <div>
                                                <Link
                                                    href={`/movies/${movie.id}`}
                                                    className="font-bold line-clamp-1 hover:text-primary block"
                                                >
                                                    {movie.title}
                                                </Link>
                                                <div className="flex justify-between items-center text-sm text-muted-foreground">
                                                    <span>
                                                        {new Date(movie.releaseDate).getFullYear()}
                                                    </span>
                                                    <span>{movie.genre}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <p className="text-muted-foreground mb-4">
                                        No movies found matching your filters.
                                    </p>
                                    <Button variant="outline" onClick={handleResetFilters}>
                                        Clear Filters
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}