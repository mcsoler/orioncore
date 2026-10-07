import type { HomeViewModel } from '../../dto/HomeViewModel';

export interface GetHomeContentUseCase {
  execute(): Promise<HomeViewModel>;
}
