import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Storage } from '@ionic/storage-angular';
import { PokemonService } from 'src/app/services/pokemon.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.page.html',
  styleUrls: ['./favorites.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class FavoritesPage implements OnInit {
  pokemons: any[] = [];

  constructor(
    private storage: Storage,
    private pokeService: PokemonService
  ) {}

  async ngOnInit() {
    await this.storage.create();
    await this.loadFavorites();
  }

  async loadFavorites() {
  let favoritesStored: any = await this.storage.get('favorites');
  let favoriteNames: string[] = [];

  if (favoritesStored) {
    if (typeof favoritesStored === 'string') {
      try {
        const parsed = JSON.parse(favoritesStored);
        if (Array.isArray(parsed)) {
          favoriteNames = parsed;
        } else {
          favoriteNames = [];
        }
      } catch (e) {
        console.error("Erro ao converter favorites:", e);
        favoriteNames = [];
      }
    } else if (Array.isArray(favoritesStored)) {
      favoriteNames = favoritesStored;
    }
  }

  console.log('Favorite names carregados:', favoriteNames);

  this.pokemons = [];

  for (const name of favoriteNames) {
    this.pokeService.getPokemonDetails(name).subscribe((poke: any) => {
      this.pokemons.push({
        id: poke.id,
        name: poke.name,
        image: poke.sprites.front_default,
        types: poke.types.map((t: any) => t.type.name),
      });
    });
  }
}
}