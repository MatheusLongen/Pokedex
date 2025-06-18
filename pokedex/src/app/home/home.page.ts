import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';
import { PokemonService } from 'src/app/services/pokemon.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class HomePage implements OnInit {
  pokemons: any[] = [];
  allPokemonList: any[] = [];
  filteredPokemonList: any[] = [];
  allPokemonNames: string[] = [];
  offset = 0;
  limit = 20;
  favoriteNames: string[] = [];
  viewMode: 'all' | 'favorites' = 'all';
  searchQuery: string = '';

  constructor(
    private pokeService: PokemonService,
    private router: Router,
    private storage: Storage
  ) {}

  async ngOnInit() {
    await this.initStorage();
    await this.loadFavorites();
    this.onModeChange();

    // carrega todos os nomes para busca global
    this.pokeService.getAllPokemonNames().subscribe((res: any) => {
      this.allPokemonNames = res.results.map((p: any) => p.name);
    });
  }

  async initStorage() {
    await this.storage.create();
  }

  nextPage() {
    if (this.viewMode === 'all') {
      this.offset += this.limit;
      this.loadPokemons();
    }
  }

  prevPage() {
    if (this.offset >= this.limit && this.viewMode === 'all') {
      this.offset -= this.limit;
      this.loadPokemons();
    }
  }

  loadPokemons() {
    this.pokeService.getPokemonList(this.offset, this.limit).subscribe(async (res: any) => {
      const results = res.results;

      const details = await Promise.all(
        results.map((p: any) =>
          firstValueFrom(this.pokeService.getPokemonDetails(p.name))
        )
      );

      this.allPokemonList = details.map((poke: any) => ({
        name: poke.name,
        id: poke.id,
        image: poke.sprites.front_default,
        types: poke.types.map((t: any) => t.type.name),
      }));

      this.filteredPokemonList = [...this.allPokemonList];
      this.applySearchFilter();
    });
  }

  async toggleFavorite(name: string) {
    const storedFavorites: string[] = (await this.storage.get('favorites')) || [];

    const updated = storedFavorites.includes(name)
      ? storedFavorites.filter((n) => n !== name)
      : [...storedFavorites, name];

    this.favoriteNames = updated;
    await this.storage.set('favorites', updated);

    if (this.viewMode === 'favorites') {
      this.loadFavoritePokemons();
    }
  }

  async loadFavorites() {
    this.favoriteNames = (await this.storage.get('favorites')) || [];
  }

  isFavorite(name: string): boolean {
    return this.favoriteNames.includes(name);
  }

  onModeChange() {
    this.searchQuery = '';
    if (this.viewMode === 'all') {
      this.loadPokemons();
    } else {
      this.loadFavoritePokemons();
    }
  }

  async loadFavoritePokemons() {
    const favoriteNames: string[] = (await this.storage.get('favorites')) || [];

    if (!favoriteNames.length) {
      this.pokemons = [];
      this.allPokemonList = [];
      this.filteredPokemonList = [];
      return;
    }

    const requests = favoriteNames.map(name =>
      firstValueFrom(this.pokeService.getPokemonDetails(name))
    );

    try {
      const results = await Promise.all(requests);
      this.allPokemonList = results.map((poke: any) => ({
        name: poke.name,
        id: poke.id,
        image: poke.sprites.front_default,
        types: poke.types.map((t: any) => t.type.name),
      }));

      this.filteredPokemonList = [...this.allPokemonList];
      this.applySearchFilter();
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      this.pokemons = [];
    }
  }

  async onSearchChange() {
    const query = this.searchQuery.trim().toLowerCase();

    if (!query) {
      this.onModeChange();
      return;
    }

    const filteredNames = this.allPokemonNames.filter((name) =>
      name.includes(query)
    );

    const details = await Promise.all(
      filteredNames.map((name) =>
        firstValueFrom(this.pokeService.getPokemonDetails(name))
      )
    );

    this.pokemons = details.map((poke: any) => ({
      name: poke.name,
      id: poke.id,
      image: poke.sprites.front_default,
      types: poke.types.map((t: any) => t.type.name),
    }));
  }

  applySearchFilter() {
    const query = this.searchQuery.trim().toLowerCase();

    if (!query) {
      this.pokemons = [...this.filteredPokemonList];
      return;
    }

    this.pokemons = this.filteredPokemonList.filter((poke: any) =>
      poke.name.toLowerCase().includes(query)
    );
  }

  viewDetails(pokemon: any) {
    this.router.navigate(['/details', pokemon.name]);
  }
}